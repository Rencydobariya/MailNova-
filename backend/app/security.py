"""Request-scoped Google authentication and bounded AI usage controls."""

from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class GoogleAuthenticationError(Exception):
    """The supplied Google access token is missing, invalid, or misconfigured."""


class AIUsageLimitError(Exception):
    """A user or the service has exceeded its AI request allowance."""


@dataclass(frozen=True)
class GoogleUser:
    subject: str
    email: str


_request_access_token: ContextVar[str | None] = ContextVar(
    "mailnova_request_access_token", default=None
)
_request_google_user: ContextVar[GoogleUser | None] = ContextVar(
    "mailnova_request_google_user", default=None
)
_identity_cache: dict[str, tuple[float, GoogleUser]] = {}
_identity_cache_lock = threading.Lock()


def set_request_access_token(token: str | None):
    return _request_access_token.set(token)


def reset_request_access_token(context_token) -> None:
    _request_access_token.reset(context_token)


def get_request_access_token() -> str | None:
    return _request_access_token.get()


def set_request_google_user(user: GoogleUser | None):
    return _request_google_user.set(user)


def reset_request_google_user(context_token) -> None:
    _request_google_user.reset(context_token)


def get_request_google_user() -> GoogleUser | None:
    return _request_google_user.get()


def _google_json_request(url: str, token: str | None = None) -> dict:
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = Request(url, headers=headers)
    with urlopen(request, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def verify_google_access_token(access_token: str) -> GoogleUser:
    """Verify token audience and resolve its Google account without storing it."""
    access_token = (access_token or "").strip()
    client_id = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "").strip()
    if not client_id:
        raise GoogleAuthenticationError(
            "Google OAuth is not configured on the MailNova server."
        )
    if not access_token or len(access_token) > 4096:
        raise GoogleAuthenticationError("A valid Google sign-in is required.")

    now = time.monotonic()
    token_key = hashlib.sha256(access_token.encode("utf-8")).hexdigest()
    with _identity_cache_lock:
        cached = _identity_cache.get(token_key)
        if cached and cached[0] > now:
            return cached[1]
        for key, (expiry, _) in list(_identity_cache.items()):
            if expiry <= now:
                _identity_cache.pop(key, None)

    try:
        token_info = _google_json_request(
            "https://oauth2.googleapis.com/tokeninfo?"
            + urlencode({"access_token": access_token})
        )
        audience = token_info.get("aud") or token_info.get("issued_to")
        if audience != client_id:
            raise GoogleAuthenticationError(
                "This Google sign-in was issued for a different app."
            )

        scopes = set(str(token_info.get("scope", "")).split())
        required_scopes = {
            "openid",
            "email",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.send",
        }
        if not required_scopes.issubset(scopes):
            raise GoogleAuthenticationError(
                "MailNova needs the Google permissions shown during sign-in."
            )

        profile = _google_json_request(
            "https://openidconnect.googleapis.com/v1/userinfo", access_token
        )
        subject = str(profile.get("sub", "")).strip()
        email = str(profile.get("email", "")).strip().lower()
        if not subject or not email or profile.get("email_verified") is not True:
            raise GoogleAuthenticationError(
                "Google did not return a verified account for this sign-in."
            )
        expires_in = max(0, int(token_info.get("expires_in", 0)))
    except GoogleAuthenticationError:
        raise
    except (HTTPError, URLError, TimeoutError, ValueError, TypeError, json.JSONDecodeError) as error:
        raise GoogleAuthenticationError(
            "Google sign-in could not be verified. Please connect your account again."
        ) from error

    user = GoogleUser(subject=subject, email=email)
    cache_ttl = min(300, max(0, expires_in - 30))
    if cache_ttl:
        with _identity_cache_lock:
            _identity_cache[token_key] = (time.monotonic() + cache_ttl, user)
    return user


def _usage_database_path() -> str:
    configured = os.getenv("MAILNOVA_USAGE_DB_PATH", "").strip()
    if configured:
        return configured
    return str(Path(__file__).resolve().parents[1] / ".mailnova_usage.sqlite3")


def _positive_limit(name: str, default: int) -> int:
    try:
        return max(1, int(os.getenv(name, str(default))))
    except (TypeError, ValueError):
        return default


def consume_ai_request(user_subject: str) -> None:
    """Atomically enforce per-user, per-minute and global daily AI limits."""
    user_key = "user:" + hashlib.sha256(user_subject.encode("utf-8")).hexdigest()
    utc_now = datetime.now(timezone.utc)
    day_key = utc_now.strftime("%Y-%m-%d")
    minute_key = utc_now.strftime("%Y-%m-%dT%H:%M")
    user_daily_limit = _positive_limit("MAILNOVA_AI_DAILY_USER_LIMIT", 40)
    global_daily_limit = _positive_limit("MAILNOVA_AI_DAILY_GLOBAL_LIMIT", 500)
    minute_limit = _positive_limit("MAILNOVA_AI_PER_MINUTE_LIMIT", 8)

    database_path = _usage_database_path()
    Path(database_path).parent.mkdir(parents=True, exist_ok=True)
    try:
        with sqlite3.connect(database_path, timeout=5) as connection:
            connection.execute("PRAGMA busy_timeout = 5000")
            connection.execute(
                "CREATE TABLE IF NOT EXISTS ai_daily_usage ("
                "usage_key TEXT NOT NULL, day_key TEXT NOT NULL, "
                "request_count INTEGER NOT NULL, "
                "PRIMARY KEY (usage_key, day_key))"
            )
            connection.execute(
                "CREATE TABLE IF NOT EXISTS ai_minute_usage ("
                "usage_key TEXT NOT NULL, minute_key TEXT NOT NULL, "
                "request_count INTEGER NOT NULL, "
                "PRIMARY KEY (usage_key, minute_key))"
            )
            connection.execute("BEGIN IMMEDIATE")

            def count(table: str, key_name: str, usage_key: str, period: str) -> int:
                row = connection.execute(
                    f"SELECT request_count FROM {table} "
                    f"WHERE usage_key = ? AND {key_name} = ?",
                    (usage_key, period),
                ).fetchone()
                return int(row[0]) if row else 0

            if count("ai_daily_usage", "day_key", user_key, day_key) >= user_daily_limit:
                raise AIUsageLimitError(
                    "MailNova's daily AI limit for this account has been reached."
                )
            if count("ai_daily_usage", "day_key", "global", day_key) >= global_daily_limit:
                raise AIUsageLimitError(
                    "MailNova's daily AI capacity has been reached. Please try again tomorrow."
                )
            if count("ai_minute_usage", "minute_key", user_key, minute_key) >= minute_limit:
                raise AIUsageLimitError(
                    "Too many AI requests in a short time. Please wait a minute and try again."
                )

            for usage_key in (user_key, "global"):
                connection.execute(
                    "INSERT INTO ai_daily_usage (usage_key, day_key, request_count) "
                    "VALUES (?, ?, 1) ON CONFLICT(usage_key, day_key) "
                    "DO UPDATE SET request_count = request_count + 1",
                    (usage_key, day_key),
                )
            connection.execute(
                "INSERT INTO ai_minute_usage (usage_key, minute_key, request_count) "
                "VALUES (?, ?, 1) ON CONFLICT(usage_key, minute_key) "
                "DO UPDATE SET request_count = request_count + 1",
                (user_key, minute_key),
            )
            connection.execute("DELETE FROM ai_daily_usage WHERE day_key < ?", (day_key,))
            connection.execute(
                "DELETE FROM ai_minute_usage WHERE minute_key < ?",
                (utc_now.strftime("%Y-%m-%dT%H:%M"),),
            )
            connection.commit()
    except AIUsageLimitError:
        raise
    except sqlite3.Error as error:
        raise AIUsageLimitError(
            "MailNova could not verify AI usage limits. Please retry shortly."
        ) from error

from fastapi import APIRouter, Header, HTTPException
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from backend.app.security import (
    GoogleAuthenticationError,
    verify_google_access_token,
)

router = APIRouter()


@router.get("/gmail/test")
def gmail_test(authorization: str | None = Header(default=None)):
    scheme, separator, token = (authorization or "").partition(" ")

    if scheme.lower() != "bearer" or not separator or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Google sign-in required. Connect your Google account and try again.",
        )

    access_token = token.strip()

    try:
        # Har request ke Google token aur account ko verify karo.
        verify_google_access_token(access_token)
    except GoogleAuthenticationError as error:
        # Server configuration missing ho to 500; invalid/expired user token ho to 401.
        is_server_config_error = "not configured" in str(error).lower()
        raise HTTPException(
            status_code=500 if is_server_config_error else 401,
            detail=(
                "Google OAuth is not configured on the MailNova server."
                if is_server_config_error
                else "Google sign-in expired. Reconnect your Google account."
            ),
        ) from error

    # Gmail service isi signed-in user ke token se banao.
    credentials = Credentials(token=access_token)

    try:
        service = build(
            "gmail",
            "v1",
            credentials=credentials,
            cache_discovery=False,
        )
        profile = service.users().getProfile(userId="me").execute()
    except HttpError as error:
        if error.resp.status == 401:
            raise HTTPException(
                status_code=401,
                detail="Google sign-in expired. Reconnect your Google account.",
            ) from error
        if error.resp.status == 403:
            raise HTTPException(
                status_code=403,
                detail="Gmail permission is missing. Reconnect and approve the requested access.",
            ) from error
        raise HTTPException(
            status_code=502,
            detail="Google Gmail API request failed.",
        ) from error

    return {
        "success": True,
        "email": profile.get("emailAddress"),
        "total_messages": profile.get("messagesTotal"),
        "total_threads": profile.get("threadsTotal"),
    }
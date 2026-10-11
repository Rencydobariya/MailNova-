# MailNova backend

## Local setup (PowerShell)

From the repository root:

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
py -m venv backend/.venv
backend/.venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

Set `GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, and the installed Chrome
extension ID in `backend/.env`. The extension obtains a Google access token
through `chrome.identity`; the backend verifies that token and its audience,
verified account, and required scopes on every API request. Gmail credentials
exist only for the duration of the request. The backend does not read
`GMAIL_TOKEN_JSON`, `token.json`, or `credentials.json`.

## OAuth and CORS configuration

Configure `MAILNOVA_EXTENSION_ID` to the exact Chrome extension ID registered
with the Chrome extension OAuth client. Production CORS allows that extension
origin only; `MAILNOVA_ALLOWED_ORIGINS` may add explicitly approved origins.
Do not use a wildcard. Mount persistent storage and set
`MAILNOVA_USAGE_DB_PATH` to its file path so per-user and global AI quotas
survive service restarts. Keep one backend instance while quotas use SQLite.

All non-health API routes require a verified user token. Gmail operations use
that same request-scoped token, and AI routes enforce the server-side limits in
`backend/.env.example`. Configure the Google Auth Platform app name, support
contact, MailNova logo, privacy policy, and scope justification before inviting
public users; see `docs/public-launch-checklist.md`.

Never package or commit `.env`, `credentials.json`, or `token.json`. No OAuth
client secret is used by the extension flow.

from google.oauth2.credentials import Credentials
from backend.app.security import get_request_access_token


# =========================================
# GMAIL API SCOPES
# =========================================

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send"
]


# =========================================
# GET GMAIL CREDENTIALS
# =========================================

def get_gmail_credentials():

    request_access_token = get_request_access_token()
    if request_access_token:
        # This token was verified for the current request by the API middleware.
        # It belongs to the user who is making this request and is never persisted.
        return Credentials(
            token=request_access_token,
            scopes=SCOPES,
        )

    raise RuntimeError(
        "A verified per-user Google sign-in is required for Gmail access."
    )

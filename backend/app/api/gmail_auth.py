from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send"
]

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
)

CREDENTIALS_FILE = os.path.join(
    BASE_DIR,
    "credentials.json"
)

TOKEN_FILE = os.path.join(
    BASE_DIR,
    "token.json"
)


def get_gmail_credentials():

    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(
            TOKEN_FILE,
            SCOPES
        )

    if (
    creds
    and creds.valid
    and creds.scopes
    and set(SCOPES).issubset(
        set(creds.scopes)
    )
): return creds




    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

    else:

        if not os.path.exists(CREDENTIALS_FILE):
            raise FileNotFoundError(
                "credentials.json not found in project root"
            )

        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            SCOPES
        )

        creds = flow.run_local_server(
            port=0
        )

    with open(TOKEN_FILE, "w") as token:
        token.write(creds.to_json())

    return creds

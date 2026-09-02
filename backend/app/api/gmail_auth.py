from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
import os


SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send"
]


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
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


    # =========================================
    # LOAD EXISTING TOKEN
    # =========================================

    if os.path.exists(TOKEN_FILE):

        try:

            creds = Credentials.from_authorized_user_file(
                TOKEN_FILE,
                SCOPES
            )

        except Exception as error:

            print(
                "MailNova: Could not load saved Gmail token:",
                error
            )

            creds = None


    # =========================================
    # CHECK VALID CREDENTIALS
    # =========================================

    if (
        creds
        and creds.valid
        and creds.scopes
        and set(SCOPES).issubset(
            set(creds.scopes)
        )
    ):

        return creds


    # =========================================
    # REFRESH EXPIRED TOKEN
    # =========================================

    if (
        creds
        and creds.expired
        and creds.refresh_token
    ):

        try:

            print(
                "MailNova: Refreshing Gmail authentication..."
            )

            creds.refresh(
                Request()
            )

            print(
                "MailNova: Gmail authentication refreshed successfully."
            )

        except RefreshError as error:

            print(
                "MailNova: Gmail token expired or revoked."
            )

            print(
                "MailNova: Starting new Gmail authentication..."
            )

            creds = None


    # =========================================
    # NEW GOOGLE LOGIN
    # =========================================

    if not creds or not creds.valid:

        if not os.path.exists(
            CREDENTIALS_FILE
        ):

            raise FileNotFoundError(
                "credentials.json not found in project root"
            )


        print(
            "MailNova: Opening Google authentication..."
        )


        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            SCOPES
        )


        creds = flow.run_local_server(
            port=0
        )


    # =========================================
    # SAVE NEW TOKEN
    # =========================================

    with open(
        TOKEN_FILE,
        "w"
    ) as token:

        token.write(
            creds.to_json()
        )


    print(
        "MailNova: Gmail authentication saved successfully."
    )


    return creds
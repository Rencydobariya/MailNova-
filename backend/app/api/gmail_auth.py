from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
import os


# =========================================
# GMAIL API SCOPES
# =========================================

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send"
]


# =========================================
# PROJECT PATH
# =========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    )
)


# =========================================
# CREDENTIAL FILES
# =========================================

CREDENTIALS_FILE = os.path.join(
    BASE_DIR,
    "credentials.json"
)


TOKEN_FILE = os.path.join(
    BASE_DIR,
    "token.json"
)


# =========================================
# GET GMAIL CREDENTIALS
# =========================================

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
    # CHECK TOKEN SCOPES
    # =========================================

    if creds:

        current_scopes = set(
            creds.scopes or []
        )

        required_scopes = set(
            SCOPES
        )


        # Existing token may have only
        # gmail.readonly permission.
        #
        # Mark as Read requires
        # gmail.modify permission.
        #
        # If the required permission is missing,
        # a new Google authorization is required.

        if not required_scopes.issubset(
            current_scopes
        ):

            print(
                "MailNova: Existing Gmail token "
                "does not have required permissions."
            )

            print(
                "MailNova: New Gmail authorization is required."
            )

            creds = None


    # =========================================
    # CHECK VALID CREDENTIALS
    # =========================================

    if (
        creds
        and creds.valid
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
                "MailNova: Gmail authentication "
                "refreshed successfully."
            )

        except RefreshError:

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
        "MailNova: Gmail authentication "
        "saved successfully."
    )


    return creds
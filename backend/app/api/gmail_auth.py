from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError

import os
import json


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
# LOCAL CREDENTIAL FILES
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
# LOAD TOKEN FROM RENDER ENVIRONMENT
# =========================================

def load_token_from_environment():

    token_json = os.getenv(
        "GMAIL_TOKEN_JSON"
    )

    if not token_json:
        return None

    try:

        token_data = json.loads(
            token_json
        )

        creds = Credentials.from_authorized_user_info(
            token_data,
            SCOPES
        )

        print(
            "MailNova: Gmail token loaded from environment."
        )

        return creds

    except Exception as error:

        print(
            "MailNova: Could not load Gmail token "
            "from environment:",
            error
        )

        return None


# =========================================
# LOAD LOCAL TOKEN
# =========================================

def load_local_token():

    if not os.path.exists(
        TOKEN_FILE
    ):
        return None

    try:

        creds = Credentials.from_authorized_user_file(
            TOKEN_FILE,
            SCOPES
        )

        print(
            "MailNova: Gmail token loaded from local token.json."
        )

        return creds

    except Exception as error:

        print(
            "MailNova: Could not load saved Gmail token:",
            error
        )

        return None


# =========================================
# CHECK TOKEN SCOPES
# =========================================

def has_required_scopes(
    creds
):

    if not creds:
        return False

    current_scopes = set(
        creds.scopes or []
    )

    required_scopes = set(
        SCOPES
    )

    return required_scopes.issubset(
        current_scopes
    )


# =========================================
# GET GMAIL CREDENTIALS
# =========================================

def get_gmail_credentials():

    creds = None


    # =========================================
    # 1. TRY RENDER ENVIRONMENT TOKEN
    # =========================================

    creds = load_token_from_environment()


    # =========================================
    # 2. FALLBACK TO LOCAL TOKEN
    # =========================================

    if not creds:

        creds = load_local_token()


    # =========================================
    # 3. CHECK REQUIRED PERMISSIONS
    # =========================================

    if creds and not has_required_scopes(
        creds
    ):

        print(
            "MailNova: Gmail token does not "
            "have required permissions."
        )

        print(
            "MailNova: gmail.modify and "
            "gmail.send permissions are required."
        )

        creds = None


    # =========================================
    # 4. VALID TOKEN
    # =========================================

    if (
        creds
        and creds.valid
    ):

        return creds


    # =========================================
    # 5. REFRESH EXPIRED TOKEN
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

            return creds

        except RefreshError as error:

            print(
                "MailNova: Gmail refresh failed:",
                error
            )

            creds = None


    # =========================================
    # 6. LOCAL DEVELOPMENT FALLBACK
    # =========================================

    if not creds:

        if not os.path.exists(
            CREDENTIALS_FILE
        ):

            raise RuntimeError(
                "MailNova Gmail authentication is not configured. "
                "Set GMAIL_TOKEN_JSON in Render Environment Variables."
            )


        print(
            "MailNova: Starting local Google authentication..."
        )


        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            SCOPES
        )


        creds = flow.run_local_server(
            port=0
        )


    # =========================================
    # 7. SAVE LOCAL TOKEN
    # =========================================

    try:

        with open(
            TOKEN_FILE,
            "w"
        ) as token:

            token.write(
                creds.to_json()
            )

    except Exception as error:

        print(
            "MailNova: Could not save local token:",
            error
        )


    print(
        "MailNova: Gmail authentication "
        "completed successfully."
    )


    return creds
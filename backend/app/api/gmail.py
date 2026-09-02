from fastapi import APIRouter
from googleapiclient.discovery import build
from pydantic import BaseModel
from email.mime.text import MIMEText
import base64

from backend.app.api.gmail_auth import get_gmail_credentials


router = APIRouter()


# =========================================
# GMAIL SERVICE
# =========================================

def get_gmail_service():

    credentials = get_gmail_credentials()

    return build(
        "gmail",
        "v1",
        credentials=credentials,
        cache_discovery=False
    )


# =========================================
# PARSE GMAIL MESSAGE
# =========================================

def parse_gmail_message(message):

    payload = message.get(
        "payload",
        {}
    )

    headers = payload.get(
        "headers",
        []
    )

    sender = ""
    subject = ""
    date = ""

    for header in headers:

        name = header.get(
            "name",
            ""
        ).lower()

        value = header.get(
            "value",
            ""
        )

        if name == "from":

            sender = value

        elif name == "subject":

            subject = value

        elif name == "date":

            date = value

    return {

        "id":
            message.get(
                "id",
                ""
            ),

        "threadId":
            message.get(
                "threadId",
                ""
            ),

        "sender":
            sender,

        "subject":
            subject,

        "date":
            date,

        "snippet":
            message.get(
                "snippet",
                ""
            ),

        "unread":
            "UNREAD" in message.get(
                "labelIds",
                []
            ),

        "starred":
            "STARRED" in message.get(
                "labelIds",
                []
            ),

        "important":
            "IMPORTANT" in message.get(
                "labelIds",
                []
            )

    }


# =========================================
# GMAIL EMAILS
# =========================================

@router.get("/gmail/emails")
def get_gmail_emails(
    page_token: str | None = None,
    max_results: int = 100
):

    service = get_gmail_service()


    # -----------------------------------------
    # SAFE PAGE SIZE
    # -----------------------------------------

    max_results = max(
        1,
        min(
            int(max_results),
            100
        )
    )


    # -----------------------------------------
    # GET MESSAGE IDS
    # -----------------------------------------

    request = (
        service
        .users()
        .messages()
        .list(
            userId="me",

            maxResults=max_results,

            pageToken=page_token,

            includeSpamTrash=True
        )
    )


    results = request.execute()


    messages = results.get(
        "messages",
        []
    )


    if not messages:

        return {

            "success":
                True,

            "count":
                0,

            "next_page_token":
                None,

            "emails":
                []

        }


    # =========================================
    # GMAIL API-SPECIFIC BATCH
    #
    # IMPORTANT:
    #
    # DO NOT USE:
    #
    # BatchHttpRequest()
    #
    # Use Gmail service's own batch method.
    # =========================================

    message_data = {}


    def batch_callback(
        request_id,
        response,
        exception
    ):

        if exception:

            print(
                "MailNova: Gmail batch error:",
                request_id,
                exception
            )

            return


        message_data[
            request_id
        ] = response


    # =========================================
    # API-SPECIFIC BATCH
    # =========================================

    batch = (
        service
        .new_batch_http_request(
            callback=batch_callback
        )
    )


    # =========================================
    # ADD MESSAGE REQUESTS
    # =========================================

    for message in messages:

        message_id = message.get(
            "id"
        )

        if not message_id:

            continue


        batch.add(

            service
            .users()
            .messages()
            .get(

                userId="me",

                id=message_id,

                format="metadata",

                metadataHeaders=[
                    "From",
                    "Subject",
                    "Date"
                ]

            ),

            request_id=message_id

        )


    # =========================================
    # EXECUTE BATCH
    # =========================================

    try:

        batch.execute()

    except Exception as error:

        print(
            "MailNova: Gmail batch execution failed:",
            error
        )

        return {

            "success":
                False,

            "count":
                0,

            "next_page_token":
                results.get(
                    "nextPageToken"
                ),

            "emails":
                [],

            "error":
                str(error)

        }


    # =========================================
    # BUILD EMAIL RESPONSE
    # =========================================

    emails = []


    for message in messages:

        message_id = message.get(
            "id"
        )

        msg = message_data.get(
            message_id
        )


        if not msg:

            continue


        email_data = parse_gmail_message(
            msg
        )


        # Gmail list response has reliable
        # threadId, so keep it if available.

        if not email_data["threadId"]:

            email_data["threadId"] = (
                message.get(
                    "threadId",
                    ""
                )
            )


        emails.append(
            email_data
        )


    print(
        f"MailNova: Gmail page loaded: "
        f"{len(emails)} emails | "
        f"Next page: "
        f"{bool(results.get('nextPageToken'))}"
    )


    # =========================================
    # RESPONSE
    # =========================================

    return {

        "success":
            True,

        "count":
            len(emails),

        "next_page_token":
            results.get(
                "nextPageToken"
            ),

        "result_size_estimate":
            results.get(
                "resultSizeEstimate"
            ),

        "emails":
            emails

    }


# =========================================
# GMAIL REPLY
# =========================================

class GmailReplyRequest(BaseModel):

    thread_id: str

    to: str

    subject: str

    body: str


# =========================================
# SEND GMAIL REPLY
# =========================================

@router.post("/gmail/reply")
def send_gmail_reply(
    request: GmailReplyRequest
):

    service = get_gmail_service()


    # -----------------------------------------
    # GET LATEST MESSAGE
    # -----------------------------------------

    thread = (
        service
        .users()
        .threads()
        .get(

            userId="me",

            id=request.thread_id,

            format="metadata",

            metadataHeaders=[
                "Message-ID",
                "References",
                "Subject",
                "From",
                "To"
            ]

        )
        .execute()
    )


    messages = thread.get(
        "messages",
        []
    )


    if not messages:

        return {

            "success":
                False,

            "message":
                "Gmail thread not found."

        }


    latest_message = messages[-1]


    headers = (
        latest_message
        .get(
            "payload",
            {}
        )
        .get(
            "headers",
            []
        )
    )


    message_id = ""

    references = ""


    # -----------------------------------------
    # READ HEADERS
    # -----------------------------------------

    for header in headers:

        name = (
            header
            .get(
                "name",
                ""
            )
            .lower()
        )

        value = header.get(
            "value",
            ""
        )


        if name == "message-id":

            message_id = value


        elif name == "references":

            references = value


    # =========================================
    # CREATE REPLY
    # =========================================

    subject = (
        request.subject
        or ""
    )


    if not subject.lower().startswith(
        "re:"
    ):

        subject = (
            "Re: " +
            subject
        )


    message = MIMEText(
        request.body,
        "plain",
        "utf-8"
    )


    message["To"] = request.to

    message["Subject"] = subject


    # -----------------------------------------
    # THREADING HEADERS
    # -----------------------------------------

    if message_id:

        message["In-Reply-To"] = (
            message_id
        )


        if references:

            message["References"] = (
                references +
                " " +
                message_id
            )

        else:

            message["References"] = (
                message_id
            )


    # =========================================
    # ENCODE
    # =========================================

    raw_message = (
        base64.urlsafe_b64encode(
            message.as_bytes()
        )
        .decode()
    )


    # =========================================
    # SEND
    # =========================================

    sent_message = (
        service
        .users()
        .messages()
        .send(

            userId="me",

            body={

                "raw":
                    raw_message,

                "threadId":
                    request.thread_id

            }

        )
        .execute()
    )


    return {

        "success":
            True,

        "message":
            "Reply sent successfully.",

        "message_id":
            sent_message.get(
                "id"
            ),

        "thread_id":
            sent_message.get(
                "threadId"
            )

    }
from fastapi import APIRouter
from googleapiclient.discovery import build
from pydantic import BaseModel
from email.mime.text import MIMEText
from html.parser import HTMLParser
import base64

from backend.app.api.gmail_auth import get_gmail_credentials
from backend.app.ai.spam_detector import is_probable_spam


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
# HTML TO TEXT
# =========================================

class GmailHTMLTextParser(HTMLParser):

    def __init__(self):

        super().__init__()

        self.parts = []


    def handle_data(self, data):

        if data:

            text = data.strip()

            if text:

                self.parts.append(text)


    def get_text(self):

        return "\n".join(self.parts)


def html_to_text(html):

    try:

        parser = GmailHTMLTextParser()

        parser.feed(html)

        return parser.get_text()

    except Exception as error:

        print(
            "MailNova: HTML to text conversion failed:",
            error
        )

        return html or ""


# =========================================
# DECODE GMAIL BODY
# =========================================

def decode_gmail_body(data):

    if not data:

        return ""

    try:

        # Gmail uses URL-safe Base64. Add only the padding
        # characters required to make the length a multiple of 4.
        padding = (4 - len(data) % 4) % 4

        decoded = base64.urlsafe_b64decode(
            data + "=" * padding
        )

        return decoded.decode(
            "utf-8",
            errors="replace"
        )

    except Exception as error:

        print(
            "MailNova: Gmail body decode error:",
            error
        )

        return ""


# =========================================
# EXTRACT EMAIL BODY
# =========================================

def extract_gmail_body(payload):

    if not payload:

        return ""


    mime_type = payload.get(
        "mimeType",
        ""
    )


    body_data = (
        payload
        .get("body", {})
        .get("data")
    )


    # -----------------------------------------
    # SIMPLE TEXT EMAIL
    # -----------------------------------------

    if body_data:

        decoded_body = decode_gmail_body(
            body_data
        )


        if mime_type == "text/html":

            return html_to_text(
                decoded_body
            )


        return decoded_body


    # -----------------------------------------
    # MULTIPART EMAIL
    # -----------------------------------------

    parts = payload.get(
        "parts",
        []
    )


    plain_text = ""

    html_text = ""


    for part in parts:

        part_mime_type = part.get(
            "mimeType",
            ""
        )


        part_body_data = (
            part
            .get("body", {})
            .get("data")
        )


        if part_body_data:

            decoded_part = decode_gmail_body(
                part_body_data
            )


            if (
                part_mime_type ==
                "text/plain"
            ):

                plain_text += (
                    "\n" +
                    decoded_part
                )


            elif (
                part_mime_type ==
                "text/html"
            ):

                html_text += (
                    "\n" +
                    html_to_text(
                        decoded_part
                    )
                )


        # -------------------------------------
        # RECURSIVE MULTIPART
        # -------------------------------------

        nested_body = extract_gmail_body(
            part
        )


        if nested_body:

            if not plain_text:

                plain_text += (
                    "\n" +
                    nested_body
                )


    # -----------------------------------------
    # PREFER PLAIN TEXT
    # -----------------------------------------

    if plain_text.strip():

        return plain_text.strip()


    if html_text.strip():

        return html_text.strip()


    return ""


# =========================================
# CLEAN EMAIL BODY
# =========================================

def clean_email_body(body):

    if not body:

        return ""


    lines = []

    previous_empty = False


    for line in body.splitlines():

        line = " ".join(
            line.split()
        )


        if not line:

            if not previous_empty:

                lines.append("")

            previous_empty = True

            continue


        lines.append(line)

        previous_empty = False


    return "\n".join(
        lines
    ).strip()


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


    # -----------------------------------------
    # READ HEADERS
    # -----------------------------------------

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


    # -----------------------------------------
    # EXTRACT FULL BODY
    # -----------------------------------------

    body = extract_gmail_body(
        payload
    )


    body = clean_email_body(
        body
    )


    # -----------------------------------------
    # BUILD EMAIL DATA
    # -----------------------------------------

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

        "body":
            body,

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
            ),

        "spam":
            is_probable_spam(
                sender=sender,
                subject=subject,
                snippet=message.get(
                    "snippet",
                    ""
                ),
                body=body,
                gmail_spam=(
                    "SPAM" in message.get(
                        "labelIds",
                        []
                    )
                )
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
    # GMAIL API BATCH
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

                # FULL is required so Gmail
                   # returns the message payload/body.
                

                format="full"

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


    spam_count = sum(
        1
        for email in emails
        if email.get("spam") is True
    )

    print(
        f"MailNova: Gmail page loaded: "
        f"{len(emails)} emails | "
        f"Spam detected: {spam_count} | "
        f"Next page: "
        f"{bool(results.get('nextPageToken'))}"
    )


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
# READ / UNREAD REQUEST
# =========================================

class MailReadStatusRequest(BaseModel):

    message_id: str


# =========================================
# MARK EMAIL AS READ
# =========================================

@router.post("/gmail/mark-read")
def mark_email_as_read(
    request: MailReadStatusRequest
):

    message_id = request.message_id.strip()


    if not message_id:

        return {

            "success":
                False,

            "message":
                "Gmail message ID is required."

        }


    try:

        service = get_gmail_service()


        updated_message = (
            service
            .users()
            .messages()
            .modify(

                userId="me",

                id=message_id,

                body={

                    "removeLabelIds": [
                        "UNREAD"
                    ]

                }

            )
            .execute()
        )


        label_ids = updated_message.get(
            "labelIds",
            []
        )


        is_unread = (
            "UNREAD" in label_ids
        )


        if is_unread:

            return {

                "success":
                    False,

                "message":
                    "Gmail did not remove the UNREAD label."

            }


        print(
            "MailNova: Email marked as READ:",
            message_id
        )


        return {

            "success":
                True,

            "message":
                "Email marked as read successfully.",

            "message_id":
                message_id,

            "unread":
                False

        }


    except Exception as error:

        print(
            "MailNova: Mark as Read failed:",
            error
        )


        return {

            "success":
                False,

            "message":
                "Could not mark email as read.",

            "error":
                str(error)

        }


# =========================================
# MARK EMAIL AS UNREAD
# =========================================

@router.post("/gmail/mark-unread")
def mark_email_as_unread(
    request: MailReadStatusRequest
):

    message_id = request.message_id.strip()


    if not message_id:

        return {

            "success":
                False,

            "message":
                "Gmail message ID is required."

        }


    try:

        service = get_gmail_service()


        updated_message = (
            service
            .users()
            .messages()
            .modify(

                userId="me",

                id=message_id,

                body={

                    "addLabelIds": [
                        "UNREAD"
                    ]

                }

            )
            .execute()
        )


        label_ids = updated_message.get(
            "labelIds",
            []
        )


        is_unread = (
            "UNREAD" in label_ids
        )


        if not is_unread:

            return {

                "success":
                    False,

                "message":
                    "Gmail did not add the UNREAD label."

            }


        print(
            "MailNova: Email marked as UNREAD:",
            message_id
        )


        return {

            "success":
                True,

            "message":
                "Email marked as unread successfully.",

            "message_id":
                message_id,

            "unread":
                True

        }


    except Exception as error:

        print(
            "MailNova: Mark as Unread failed:",
            error
        )


        return {

            "success":
                False,

            "message":
                "Could not mark email as unread.",

            "error":
                str(error)

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

    subject = request.subject or ""


    if not subject.lower().startswith(
        "re:"
    ):

        subject = "Re: " + subject


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

        message["In-Reply-To"] = message_id


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
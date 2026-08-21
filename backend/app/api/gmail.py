from fastapi import APIRouter
from googleapiclient.discovery import build
from pydantic import BaseModel
from email.mime.text import MIMEText
import base64

from backend.app.api.gmail_auth import get_gmail_credentials


router = APIRouter()


def get_gmail_service():

    credentials = get_gmail_credentials()

    return build(
        "gmail",
        "v1",
        credentials=credentials
    )


@router.get("/gmail/emails")
def get_gmail_emails(
    page_token: str | None = None,
    max_results: int = 100
):

    service = get_gmail_service()

    # Gmail messages list
    request = service.users().messages().list(
        userId="me",
        maxResults=max_results,
        pageToken=page_token
    )

    results = request.execute()

    messages = results.get("messages", [])

    emails = []

    for message in messages:

        msg = service.users().messages().get(
            userId="me",
            id=message["id"],
            format="metadata",
            metadataHeaders=[
                "From",
                "Subject",
                "Date"
            ]
        ).execute()

        headers = msg.get(
            "payload",
            {}
        ).get(
            "headers",
            []
        )

        email_data = {
            "id": message["id"],
            "threadId": message.get("threadId", ""),
            "sender": "",
            "subject": "",
            "date": "",
            "snippet": msg.get("snippet", "")
        }

        for header in headers:

            name = header["name"]
            value = header["value"]

            if name.lower() == "from":
                email_data["sender"] = value

            elif name.lower() == "subject":
                email_data["subject"] = value

            elif name.lower() == "date":
                email_data["date"] = value

        emails.append(email_data)

    return {
        "success": True,
        "count": len(emails),
        "next_page_token": results.get("nextPageToken"),
        "emails": emails
    }

# =========================================
# GMAIL REPLY
# =========================================

class GmailReplyRequest(BaseModel):

    thread_id: str

    to: str

    subject: str

    body: str


@router.post("/gmail/reply")
def send_gmail_reply(
    request: GmailReplyRequest
):

    service = get_gmail_service()


    # -----------------------------------------
    # Get latest message from the thread
    # -----------------------------------------

    thread = service.users().threads().get(
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
    ).execute()


    messages =  thread.get("messages", [])


    if not messages:

        return {
            "success": False,
            "message": "Gmail thread not found."
        }


    latest_message =messages[-1]


    headers =latest_message.get(
            "payload",
            {}
        ).get(
            "headers",
            []
        )


    message_id = ""

    references = ""


    for header in headers:

        name = header["name"].lower()

        value = header["value"]


        if name == "message-id":

            message_id = value


        elif name == "references":

            references = value


    # -----------------------------------------
    # Create Reply Email
    # -----------------------------------------

    subject = request.subject or ""


    if not subject.lower().startswith("re:"):

        subject = "Re: " + subject


    message = MIMEText(
        request.body,
        "plain",
        "utf-8"
    )


    message["To"] = request.to

    message["Subject"] = subject


    if message_id:

        message["In-Reply-To"] = message_id


        if references:

            message["References"] = (
                references +
                " " +
                message_id
            )

        else:

            message["References"] = message_id


    # -----------------------------------------
    # Encode Gmail Message
    # -----------------------------------------

    raw_message = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()


    # -----------------------------------------
    # Send Reply
    # -----------------------------------------

    sent_message =service.users().messages().send(
            userId="me",
            body={
                "raw": raw_message,
                "threadId": request.thread_id
            }
        ).execute()


    return {

        "success": True,

        "message":
            "Reply sent successfully.",

        "message_id":
            sent_message.get("id"),

        "thread_id":
            sent_message.get("threadId")

    }
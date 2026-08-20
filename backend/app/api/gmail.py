from fastapi import APIRouter
from googleapiclient.discovery import build

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
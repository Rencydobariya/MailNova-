from fastapi import APIRouter
from googleapiclient.discovery import build

from backend.app.api.gmail_auth import get_gmail_credentials


router = APIRouter()


@router.get("/gmail/test")
def gmail_test():

    credentials = get_gmail_credentials()

    service = build(
        "gmail",
        "v1",
        credentials=credentials
    )

    profile = service.users().getProfile(
        userId="me"
    ).execute()

    return {
        "success": True,
        "email": profile.get("emailAddress"),
        "total_messages": profile.get("messagesTotal"),
        "total_threads": profile.get("threadsTotal")
    }
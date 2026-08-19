from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os


load_dotenv()

router = APIRouter()


api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


class SummaryRequest(BaseModel):
    sender: str
    subject: str
    body: str


@router.post("/summarize")
def summarize_email(email: SummaryRequest):

    prompt = f"""
You are MailNova, an intelligent AI email assistant.

Summarize the following email clearly and concisely.

EMAIL INFORMATION:

Sender:
{email.sender}

Subject:
{email.subject}

Email Body:
{email.body}

INSTRUCTIONS:

1. Explain the main purpose of the email.
2. Mention the most important information.
3. Mention any important date, deadline, payment, order, meeting,
   or action required if present.
4. Do not invent information.
5. Keep the summary short and easy to understand.
6. Write the summary in the same language as the email.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "success": True,
        "summary": response.text
    }
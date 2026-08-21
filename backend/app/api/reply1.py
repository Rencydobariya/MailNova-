from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os


load_dotenv()


router = APIRouter()


api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found in .env"
    )


client = genai.Client(
    api_key=api_key
)


class ReplyRequest(BaseModel):

    sender: str
    subject: str
    body: str
    tone: str


@router.post("/generate-reply")
def generate_reply(request: ReplyRequest):

    prompt = f"""
You are MailNova, an intelligent AI email assistant.

Generate a suitable reply to the following email.

EMAIL INFORMATION:

Sender:
{request.sender}

Subject:
{request.subject}

Email Body:
{request.body}

REPLY TONE:
{request.tone}

INSTRUCTIONS:

1. Understand the purpose of the email.
2. Write a natural and relevant reply.
3. Follow the requested tone.
4. Do not invent information.
5. Do not claim that an action was completed unless the email provides that information.
6. Keep the reply concise and professional.
7. Reply in the same language as the original email.
8. Return only the reply text.
"""


    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )


    return {

        "success": True,

        "reply":
            response.text.strip()

    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os

from backend.app.api.summary import router as summary_router
from backend.app.api.gmail_routes import router as gmail_router
from backend.app.api.gmail import router as gmail_emails_router


load_dotenv()
app = FastAPI(title="MailNova AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router)
app.include_router(gmail_router)
app.include_router(gmail_emails_router)


api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


class EmailRequest(BaseModel):
    sender: str
    subject: str
    body: str
    question: str


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "MailNova AI Backend is running 🚀"
    }




@app.post("/ask-ai")
def ask_ai(email: EmailRequest):

    prompt = f"""
You are MailNova, an intelligent AI email assistant.

You are answering a user's question about a specific email.

EMAIL INFORMATION:

Sender:
{email.sender}

Subject:
{email.subject}

Email Body:
{email.body}


USER QUESTION:
{email.question}


INSTRUCTIONS:

1. Answer the user's question specifically using the email information.
2. Do not invent information that is not present in the email.
3. If the answer cannot be found from the email, clearly say that.
4. Keep the answer concise and easy to understand.
5. You can explain the email, identify important information,
   suggest actions, summarize details, or answer specific questions.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return {
        "success": True,
        "response": response.text
    }
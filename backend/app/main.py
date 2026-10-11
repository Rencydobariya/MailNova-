from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
import os

from backend.app.api.summary import router as summary_router
from backend.app.api.gmail_routes import router as gmail_router
from backend.app.api.gmail import router as gmail_emails_router
from backend.app.api.reply1 import router as reply_router
from backend.app.api.ai_intelligence import router as ai_intelligence_router
from backend.app.security import (
    AIUsageLimitError,
    GoogleAuthenticationError,
    consume_ai_request,
    reset_request_access_token,
    reset_request_google_user,
    set_request_access_token,
    set_request_google_user,
    verify_google_access_token,
    get_request_google_user,
)

load_dotenv()
app = FastAPI(title="MailNova AI Backend")


def _is_production_environment():
    """Detect production deployments so unfinished public APIs fail closed."""
    configured_environment = os.getenv("MAILNOVA_ENV", "").strip().lower()
    return (
        configured_environment in {"prod", "production"}
        or os.getenv("RENDER", "").strip().lower() == "true"
    )


AI_ENDPOINTS = {
    "/ask-ai",
    "/summarize",
    "/generate-reply",
    "/ai/analyze-emails",
    "/ai/natural-search",
}


@app.middleware("http")
async def authenticate_and_limit_api(request: Request, call_next):
    """Authenticate every API call and enforce server-side AI usage limits."""
    if request.url.path == "/" or request.method == "OPTIONS":
        return await call_next(request)

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1_000_000:
                return JSONResponse(
                    status_code=413,
                    content={"success": False, "error": "Request body is too large."},
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Invalid request size."},
            )

    authorization = request.headers.get("authorization", "")
    scheme, separator, access_token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not separator or not access_token.strip():
        return JSONResponse(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            content={"success": False, "error": "Connect your Google account to MailNova."},
        )

    try:
        user = await run_in_threadpool(verify_google_access_token, access_token.strip())
    except GoogleAuthenticationError as error:
        return JSONResponse(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            content={"success": False, "error": str(error)},
        )

    token_context = set_request_access_token(access_token.strip())
    user_context = set_request_google_user(user)
    try:
        if request.url.path in AI_ENDPOINTS:
            try:
                await run_in_threadpool(consume_ai_request, user.subject)
            except AIUsageLimitError as error:
                return JSONResponse(
                    status_code=429,
                    content={"success": False, "error": str(error)},
                )
        return await call_next(request)
    finally:
        reset_request_google_user(user_context)
        reset_request_access_token(token_context)


allowed_origins = [
    origin.strip()
    for origin in os.getenv("MAILNOVA_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
extension_id = os.getenv("MAILNOVA_EXTENSION_ID", "").strip()
if extension_id:
    allowed_origins.append(f"chrome-extension://{extension_id}")
if not _is_production_environment():
    allowed_origins.extend(["http://localhost:8000", "http://127.0.0.1:8000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(set(allowed_origins)),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(summary_router)
app.include_router(gmail_router)
app.include_router(gmail_emails_router)
app.include_router(reply_router)
app.include_router(ai_intelligence_router)



api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


class EmailRequest(BaseModel):
    sender: str = Field(max_length=300)
    subject: str = Field(max_length=500)
    body: str = Field(max_length=12000)
    question: str = Field(max_length=2000)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "MailNova AI Backend is running 🚀"
    }


@app.get("/auth/me")
def authenticated_user():
    user = get_request_google_user()
    if user is None:
        return JSONResponse(
            status_code=401,
            content={"success": False, "error": "Google sign-in is required."},
        )
    return {"success": True, "subject": user.subject, "email": user.email}




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

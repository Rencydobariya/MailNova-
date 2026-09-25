from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai
from dotenv import load_dotenv
import json
import os
import re

load_dotenv()

router = APIRouter()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)

ALLOWED_CATEGORIES = {
    "Work",
    "Education",
    "Shopping",
    "Banking",
    "Personal",
}


class EmailForAI(BaseModel):
    id: str = ""
    sender: str = ""
    subject: str = ""
    snippet: str = ""
    body: str = ""
    gmail_spam: bool = False


class AnalyzeEmailsRequest(BaseModel):
    emails: list[EmailForAI] = Field(default_factory=list, max_length=25)


class NaturalSearchRequest(BaseModel):
    query: str


def _extract_json(text: str):
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\[[\s\S]*\]", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return None


def _normalise_analysis(item, email):
    category = str(item.get("category", "Personal"))
    if category not in ALLOWED_CATEGORIES:
        category = "Personal"

    try:
        priority = int(item.get("priority", 3))
    except (TypeError, ValueError):
        priority = 3
    priority = max(1, min(5, priority))

    spam = bool(item.get("spam", False)) or bool(email.gmail_spam)

    try:
        spam_confidence = int(item.get("spam_confidence", 0))
    except (TypeError, ValueError):
        spam_confidence = 0
    spam_confidence = max(0, min(100, spam_confidence))

    return {
        "id": email.id,
        "category": category,
        "priority": priority,
        "priority_score": priority * 20,
        "spam": spam,
        "spam_confidence": spam_confidence,
        "spam_reason": str(item.get("spam_reason", ""))[:300],
        "priority_reason": str(item.get("priority_reason", ""))[:300],
    }


@router.post("/ai/analyze-emails")
def analyze_emails(request: AnalyzeEmailsRequest):
    if not request.emails:
        return {"success": True, "results": []}

    compact_emails = []
    for index, email in enumerate(request.emails):
        compact_emails.append(
            {
                "index": index,
                "id": email.id,
                "sender": email.sender[:300],
                "subject": email.subject[:500],
                "snippet": email.snippet[:800],
                "body": email.body[:1200],
                "gmail_spam": email.gmail_spam,
            }
        )

    prompt = f"""
You are MailNova's Email Intelligence Agent.
Analyze each email independently for CATEGORY, PRIORITY and SPAM risk.

Return ONLY a JSON array. One object per input email, in the SAME ORDER.
Each object must contain:
- id: exact input id
- category: exactly one of Work, Education, Shopping, Banking, Personal
- priority: integer 1 to 5 (5 = most urgent/important)
- priority_reason: short factual reason
- spam: true or false
- spam_confidence: integer 0 to 100
- spam_reason: short factual reason; empty string when not spam

Rules:
1. Use the actual email context, not isolated keywords.
2. Promotions are not automatically spam.
3. Legitimate newsletters, receipts, bank alerts, college notices and job emails can be safe.
4. Treat phishing, impersonation, credential theft, fake rewards, malicious payment requests and deceptive urgent-link requests as high spam risk.
5. If gmail_spam is true, spam MUST be true.
6. Do not invent dates, people, actions or facts.
7. Keep reasons under 25 words.

EMAILS:
{json.dumps(compact_emails, ensure_ascii=False)}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
        parsed = _extract_json(response.text)
        if not isinstance(parsed, list):
            raise ValueError("AI returned an invalid JSON array")

        results = []
        by_index = {item.get("index"): item for item in parsed if isinstance(item, dict)}
        for index, email in enumerate(request.emails):
            item = by_index.get(index, {})
            results.append(_normalise_analysis(item, email))

        return {"success": True, "results": results}

    except Exception as error:
        print("MailNova AI Intelligence Error:", error)
        return {
            "success": False,
            "results": [],
            "error": str(error),
        }


@router.post("/ai/natural-search")
def natural_search(request: NaturalSearchRequest):
    query = (request.query or "").strip()
    if not query:
        return {"success": True, "query": ""}

    prompt = f"""
You convert a user's natural-language email search into MailNova's supported local search syntax.

Supported syntax:
from:value
subject:value
is:unread
is:read
is:important
is:starred
is:spam
category:work
category:education
category:shopping
category:banking
category:personal
after:YYYY-MM-DD
before:YYYY-MM-DD
quoted phrases are allowed
plain words are allowed as free-text terms.

Return ONLY JSON in this exact shape:
{{"query":"..."}}

Do not add unsupported operators. Do not invent dates. If a relative date cannot be resolved safely, omit it.

USER QUERY:
{query}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
        parsed = _extract_json(response.text)
        normalised = str(parsed.get("query", "")).strip() if isinstance(parsed, dict) else ""
        return {"success": True, "query": normalised or query}
    except Exception as error:
        print("MailNova AI Search Error:", error)
        return {"success": False, "query": query, "error": str(error)}

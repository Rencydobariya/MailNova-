# MailNova

MailNova is a Chrome extension for viewing Gmail messages with email summaries,
AI assistance, categories, priority indicators, and reply tools. The extension
uses a Python/FastAPI backend for Gmail and Gemini API operations.

## Local development

1. Create `backend/.env` from [`backend/.env.example`](backend/.env.example) and
   add a Gemini API key. Keep this file private.
2. Install backend dependencies and start the local API:

   ```powershell
   py -m venv backend/.venv
   .\backend\.venv\Scripts\Activate.ps1
   pip install -r backend/requirements.txt
   uvicorn backend.app.main:app --reload
   ```

3. Load the `extension` folder as an unpacked extension in Chrome. The extension
   currently points to the hosted API, so use a local development build/config
   before testing against the local backend.

## Public launch status

The extension now requests per-user Google OAuth, and all non-health backend
routes require a verified user token. Gmail actions use that user's token, and
AI routes enforce server-side quotas. Public release still depends on setting
the registered extension ID and persistent quota database in production,
configuring Google Auth Platform branding and verification, and publishing the
privacy/store disclosures. See
[`docs/public-launch-checklist.md`](docs/public-launch-checklist.md).

Do not upload the repository root or commit `.env`, `credentials.json`, or
`token.json`. The Chrome Web Store package should contain only the reviewed
extension files and its required public assets.

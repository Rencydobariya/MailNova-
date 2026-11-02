# MailNova Chrome Web Store listing draft

Use this copy after the user-owned website domain, OAuth consent details, and
actual Chrome Web Store item ID have been confirmed. The listing must agree
with the extension package and privacy policy.

## Listing text

**Name**

MailNova: AI Email Assistant for Gmail

**Short description**

Summarize Gmail, spot messages that may need attention, search with AI, and draft replies you choose to send.

**Detailed description**

MailNova is a Chrome extension that helps you review and organize Gmail with a
set of practical inbox tools and optional AI assistance.

**What you can do**

- Review concise summaries of the email or conversation you are viewing.
- Ask questions about a selected message and use natural-language email
  search assistance.
- See category, priority, and possible-spam cues to support your own review.
- Mark messages read or unread and use the available Gmail inbox controls.
- Draft a reply with AI assistance, then review and edit it before choosing to
  send it.

**Your account and data**

MailNova asks you to connect a Google account before using Gmail features. To
provide a requested feature, the extension sends relevant message information
to the MailNova backend. When an AI feature runs, relevant email text and
context may be sent to Google Gemini to generate a result. The extension keeps
some message and AI-result data in Chrome storage to support its workspace.
You can clear this local data in MailNova settings and revoke Google access in
your Google Account. MailNova does not sell Gmail data or use it for
advertising. Read the full privacy policy before connecting your account.

MailNova does not send a reply until you choose to send it. AI output can be
incorrect, so review it before using it.

MailNova is an independent product and is not affiliated with Google.

## Dashboard values

- **Support email:** `rencydobariya76@gmail.com`
- **Homepage:** `https://<user-owned-domain>/`
- **Privacy policy:** `https://<user-owned-domain>/privacy-policy`
- **Distribution:** Public; all regions, if the owner intends worldwide access.
- **Pricing:** Free; no in-extension purchases are implemented in the current
  package.

## Permission justifications

- **Identity:** Sign in to Google and obtain the user's consent token for
  Gmail-backed features.
- **Storage:** Save MailNova preferences and the local email/AI-result cache;
  the user can clear it from extension settings.
- **`https://mail.google.com/*` host access:** Run MailNova's Gmail interface
  and read the visible page content needed by the inbox UI.
- **MailNova API host:** Send authenticated, user-requested operations to the
  MailNova backend.
- **`gmail.modify`:** Read and update supported Gmail message state, including
  mark-read/unread, send replies after user action, and other supported inbox
  actions. This permission is restricted and requires Google review.

## Privacy disclosures to reconcile before submission

1. The OAuth Data access screen currently shows `gmail.readonly`, while the
   release extension manifest now requests `gmail.modify`. Align the consent
   configuration with the implemented features before verification.
2. Declare personal communications/email content, account identifiers, and
   relevant extension activity/preferences in the Chrome Web Store privacy
   practices form as applicable to its current categories.
3. State that relevant Gmail content can be processed by the MailNova backend
   and sent to Google Gemini for AI features. Match the exact Google API tier
   and retention terms used in production.
4. Confirm the public homepage and privacy policy use the same verified,
   user-owned domain and that the store's privacy URL exactly matches the
   consent-screen URL.

## Review evidence to prepare

- A short screen recording showing installation, Google permission consent,
  reading/summarizing a message, generating a reply draft, and the user
  choosing whether to send it.
- Test instructions for reviewers that use a safe Gmail test account and do
  not require sharing the owner's credentials.
- Current screenshots and promo artwork from the `MailNova-Store-*` files in
  the repository root.

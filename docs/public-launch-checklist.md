# MailNova public launch checklist

## Current release state — 2 November 2026

- A public product homepage is now served at `/`; the privacy policy is served
  at `/privacy-policy`, and `/healthz` is available for the hosting health
  check. These changes are local and still need to be deployed.
- `MailNova-1.0.4.zip` matches the current distributable files in `extension/`;
  it requests only the scopes used by the public feature set and contains no
  local environment or token files.
  The Chrome Web Store dashboard item, package ID, and listing state still need
  to be confirmed in the publisher account.
- The connected Google Cloud project currently lists only the restricted
  `gmail.readonly` scope. Release source now requests `gmail.modify`, which
  covers the implemented read, update, compose, and send operations without
  separately requesting the redundant `gmail.send` scope. Add `gmail.modify`
  to the consent configuration before requesting verification.
- A registered domain whose DNS the owner controls is required for the OAuth
  homepage, privacy policy, and Google domain ownership verification. Google
  requires a verified domain property; the shared Render subdomain alone does
  not provide control of its DNS.
- The Google Cloud project and Chrome Web Store account were accessible in the
  user's Chrome profile, but no account settings or submissions have been
  changed in this workspace session.

## Go-live gates

1. Connect a user-owned domain to the Render service. Put the homepage and
   privacy policy on that same verified domain, then complete Google's
   Search Console DNS ownership check with the Google Cloud project owner.
2. Confirm the actual Chrome Web Store item ID and OAuth client ID. If the
   store item ID differs from the development extension ID, update the OAuth
   client registration and the backend's `MAILNOVA_EXTENSION_ID` together.
3. Declare every scope the public extension actually requests. Current source
   uses `gmail.modify` for Gmail operations. Keep the policy and in-product
   disclosure consistent with backend and Gemini data processing.
4. Complete OAuth branding and verification. Since Gmail data is handled by
   the backend, prepare for Google's restricted-scope security assessment and
   its annual re-assessment requirement.
5. Configure Render production secrets and a persistent disk for the SQLite
   quota database. Set `MAILNOVA_ENV=production`, `GOOGLE_OAUTH_CLIENT_ID`,
   `MAILNOVA_EXTENSION_ID`, `GEMINI_API_KEY`, and
   `MAILNOVA_USAGE_DB_PATH`; keep a single backend instance while SQLite is
   used.
6. Finish the Chrome Web Store listing and privacy declarations, confirm the
   desired public regions, then submit the package for review. Chrome Web Store
   review must complete before users can install it from a public listing.

## Implemented in this repository

- Chrome extension OAuth uses the supplied extension client ID and requests
  `openid`, `email`, and `gmail.modify` through `chrome.identity`.
- Every non-health API route requires a Google access token whose audience,
  scopes, and verified user profile are checked by the backend.
- Gmail reads, read/unread changes, and replies use only the verified
  request-scoped user's access token. Shared server token and local token-file
  fallback paths have been removed.
- AI endpoints require the same verified user, apply per-user, per-minute, and
  global daily server quotas, and cap request sizes.
- Production CORS accepts the configured extension origin instead of every
  website. The extension manifest includes the deployed API host permission.

## Google Auth Platform setup before public access

The Google consent screen's branding is configured in Google Cloud, not in the
extension source. Use the Chrome extension OAuth client already supplied by the
owner and set the following values in Google Auth Platform:

- **App name:** MailNova
- **App logo:** `extension/assets/icons/mailnova-mascot-128.png` (use a clean,
  square logo with a transparent or solid background)
- **User support email:** a monitored MailNova support address
- **Developer contact email:** a monitored MailNova operator address
- **Application homepage and privacy policy:** published MailNova HTTPS pages
- **Authorized domain:** the verified domain hosting those pages and the API
- **Scopes:** `openid`, `email`, and `https://www.googleapis.com/auth/gmail.modify`

Suggested plain-language purpose for the Google verification form and product
disclosure:

> MailNova helps you triage your Gmail. It reads messages you choose to display
> so it can summarize them and identify priority or possible spam. It can mark a
> message read or unread, and it sends a reply only after you choose to send it.
> Message content is sent to MailNova's backend and its AI provider to provide
> these features. MailNova does not use a shared Gmail account.

Google's consent dialog will show the configured app name, logo, support contact,
and requested permission scopes. The extension triggers it through Chrome's
interactive sign-in flow; users must accept before any API request can run.

## Deployment values and launch requirements

1. Set `GOOGLE_OAUTH_CLIENT_ID` to the supplied extension client ID and
   `MAILNOVA_EXTENSION_ID` to the exact ID registered on that OAuth client.
2. Set `MAILNOVA_ENV=production`, `GEMINI_API_KEY`, and a persistent
   `MAILNOVA_USAGE_DB_PATH`. The SQLite quota store currently assumes a single
   backend instance; use shared transactional storage before running multiple
   instances.
3. Configure the Google Auth Platform branding and verification, including
   approval for the restricted `gmail.modify` scope. Google may require a
   security assessment for the restricted-scope data handling model.
4. Publish a privacy policy and Chrome Web Store Limited Use disclosure that
   accurately describe message transmission to MailNova and its AI provider,
   local extension caching, retention, deletion, and disconnect behavior.
5. Build and review a clean extension package. Check the final extension ID,
   screenshots, support contact, production API host, store listing, and that no
   `.env`, `credentials.json`, or `token.json` is included.
6. Test with a small invite-only group, monitor auth failures and actual Gemini
   spend, then decide whether to expand access.

No client secret is used or needed by the Chrome extension OAuth flow. Do not
add a client secret to the extension or commit one to this repository.

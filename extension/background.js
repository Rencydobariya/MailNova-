console.log("MailNova Background Loaded");0

const MAILNOVA_API_ORIGINS = new Set([
    "https://mailnova-9tzz.onrender.com",
    "http://127.0.0.1:8000",
    "http://localhost:8000"
]);

let mailnovaTokenRequest = null;
let mailnovaTokenRequestInteractive = false;

function requestMailnovaAccessToken(interactive) {
    if (mailnovaTokenRequest && (!interactive || mailnovaTokenRequestInteractive)) {
        return mailnovaTokenRequest;
    }

    const request = new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, token => {
            const error = chrome.runtime.lastError;
            if (error || !token) {
                reject(new Error(
                    interactive
                        ? error?.message || "Google sign-in was not completed."
                        : "Connect your Google account in MailNova Settings to continue."
                ));
                return;
            }
            resolve(token);
        });
    });

    mailnovaTokenRequest = request;
    mailnovaTokenRequestInteractive = interactive;
    const clearPendingRequest = () => {
        if (mailnovaTokenRequest === request) {
            mailnovaTokenRequest = null;
            mailnovaTokenRequestInteractive = false;
        }
    };
    request.then(clearPendingRequest, clearPendingRequest);
    return request;
}

function removeMailnovaCachedToken(token) {
    return new Promise((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
            const error = chrome.runtime.lastError;
            if (error) reject(new Error(error.message));
            else resolve();
        });
    });
}

async function fetchMailnovaApi(message) {
    const url = new URL(String(message?.url || ""));
    if (!MAILNOVA_API_ORIGINS.has(url.origin)) {
        throw new Error("MailNova blocked a request to an unapproved API host.");
    }

    const method = String(message?.options?.method || "GET").toUpperCase();
    if (!["GET", "POST"].includes(method)) {
        throw new Error("MailNova blocked an unsupported API method.");
    }

    const options = message.options || {};
    const headers = new Headers(options.headers || {});
    const interactive = options.interactive === true;
    const send = async token => {
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(url.href, {
            method,
            headers,
            body: method === "GET" ? undefined : options.body,
            cache: "no-store"
        });
    };

    let accessToken = await requestMailnovaAccessToken(interactive);
    let response = await send(accessToken);
    if (response.status === 401) {
        await removeMailnovaCachedToken(accessToken);
        accessToken = await requestMailnovaAccessToken(interactive);
        response = await send(accessToken);
    }

    return {
        success: true,
        status: response.status,
        body: await response.text(),
        headers: { "Content-Type": response.headers.get("content-type") || "application/json" }
    };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "MAILNOVA_API_REQUEST") {
        fetchMailnovaApi(message)
            .then(sendResponse)
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message?.type === "MAILNOVA_DISCONNECT_GOOGLE") {
        chrome.identity.clearAllCachedAuthTokens(() => {
            const error = chrome.runtime.lastError;
            if (error) {
                sendResponse({ success: false, error: error.message });
                return;
            }
            chrome.storage.local.remove([
                "mailnova_email_cache",
                "mailnova_email_cache_time",
                "mailnova_email_cache_version",
                "mailnova_summaries",
                "mailnova_ai_intelligence_cache_v2",
                "mailnova_read_state_overrides",
                "mailnova_auto_summary_daily_usage",
                "mailnova_cache_google_subject"
            ], () => sendResponse({ success: true }));
        });
        return true;
    }

    return false;
});

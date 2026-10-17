const MAILNOVA_API =
    "https://mailnova-9tzz.onrender.com";

const MAILNOVA_CACHE_ACCOUNT_KEY = "mailnova_cache_google_subject";
const MAILNOVA_USER_DATA_KEYS = [
    "mailnova_email_cache",
    "mailnova_email_cache_time",
    "mailnova_email_cache_version",
    "mailnova_email_cache_complete",
    "mailnova_summaries",
    "mailnova_ai_intelligence_cache_v2",
    "mailnova_read_state_overrides",
    "mailnova_auto_summary_daily_usage"
];


function mailnovaApiFetch(url, options = {}) {
    const headers = Object.fromEntries(
        new Headers(options.headers || {}).entries()
    );
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: "MAILNOVA_API_REQUEST",
                url: String(url),
                options: {
                    method: options.method || "GET",
                    headers,
                    body: options.body,
                    interactive: options.interactive === true
                }
            },
            response => {
                const runtimeError = chrome.runtime.lastError;
                if (runtimeError || !response?.success) {
                    reject(new Error(
                        response?.error || runtimeError?.message ||
                        "MailNova could not complete the authenticated request."
                    ));
                    return;
                }
                resolve(new Response(response.body, {
                    status: response.status,
                    headers: response.headers
                }));
            }
        );
    });
}


async function ensureMailnovaUserCache() {
    const response = await mailnovaApiFetch(
        `${MAILNOVA_API}/auth/me`,
        { method: "GET", cache: "no-store" }
    );
    const user = await response.json();
    if (!response.ok || !user.success || !user.subject) {
        throw new Error(user.error || "MailNova could not verify your Google account.");
    }

    const stored = await chrome.storage.local.get(MAILNOVA_CACHE_ACCOUNT_KEY);
    if (stored[MAILNOVA_CACHE_ACCOUNT_KEY] !== user.subject) {
        await chrome.storage.local.remove(MAILNOVA_USER_DATA_KEYS);
        await chrome.storage.local.set({
            [MAILNOVA_CACHE_ACCOUNT_KEY]: user.subject
        });
        if (typeof mailnovaCacheComplete !== "undefined") {
            mailnovaCacheComplete = false;
        }
        if (typeof mailnovaEmails !== "undefined" && Array.isArray(mailnovaEmails)) {
            mailnovaEmails.length = 0;
        }
    }
    return user.subject;
}


function disconnectMailnovaGoogleAccount() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "MAILNOVA_DISCONNECT_GOOGLE" },
            response => {
                const runtimeError = chrome.runtime.lastError;
                if (runtimeError || !response?.success) {
                    reject(new Error(
                        response?.error || runtimeError?.message ||
                        "MailNova could not disconnect this Google account."
                    ));
                    return;
                }
                if (typeof mailnovaEmails !== "undefined" && Array.isArray(mailnovaEmails)) {
                    mailnovaEmails.length = 0;
                }
                if (typeof renderEmails === "function") {
                    renderEmails([]);
                }
                resolve(true);
            }
        );
    });
}


/* =========================================
   GMAIL PAGINATION SETTINGS
========================================= */

const MAILNOVA_PAGE_SIZE =
    50;


/*
   Gmail quota protection.

   Gmail metadata is fetched in batches of up
   to 50. A short pause between pages helps
   avoid hitting per-user Gmail rate limits.
*/
const MAILNOVA_PAGE_DELAY_MS =
    1500;


/*
   Retry delays for Gmail quota and temporary server errors.
*/
const MAILNOVA_RETRY_DELAYS = [
    3000,
    8000,
    15000
];


/*
   Prevent duplicate full Gmail syncs.
*/
let mailnovaFetchAllPromise =
    null;


/* =========================================
   EMAIL CACHE
========================================= */

const MAILNOVA_CACHE_KEY =
    "mailnova_email_cache";


const MAILNOVA_CACHE_TIME_KEY =
    "mailnova_email_cache_time";

const MAILNOVA_CACHE_COMPLETE_KEY =
    "mailnova_email_cache_complete";


const MAILNOVA_CACHE_VERSION =
    4;


/* =========================================
   SMALL DELAY HELPER
========================================= */

function mailnovaDelay(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================
   FETCH ONE GMAIL PAGE
========================================= */

async function fetchGmailEmails(
    pageToken = null,
    maxResults = MAILNOVA_PAGE_SIZE
) {

    try {

        let url =
            `${MAILNOVA_API}/gmail/emails` +
            `?max_results=${maxResults}`;


        if (pageToken) {

            url +=
                `&page_token=${encodeURIComponent(
                    pageToken
                )}`;

        }


        const response =
            await mailnovaApiFetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            const error =
                new Error(
                    `Gmail API failed: ${response.status}`
                );


            error.status =
                response.status;


            throw error;

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.error ||
                "Gmail emails could not be fetched"
            );

        }


        console.log(
            "MailNova: Gmail page loaded:",
            data.emails?.length || 0
        );


        return data;

    }

    catch (error) {

        console.error(
            "MailNova Gmail Fetch Error:",
            error
        );


        return {

            success: false,

            emails: [],

            next_page_token: null,

            error:
                error.message ||
                "Gmail request failed",

            status:
                error.status || 0

        };

    }

}


/* =========================================
   FETCH PAGE WITH RETRY
========================================= */

async function fetchGmailPageWithRetry(
    pageToken = null,
    maxResults = MAILNOVA_PAGE_SIZE
) {

    let attempt = 0;


    while (
        true
    ) {

        const page =
            await fetchGmailEmails(
                pageToken,
                maxResults
            );


        if (
            page.success
        ) {

            return page;

        }


        const status =
            Number(
                page.status || 0
            );


        /*
           Retry only for rate limiting /
           temporary server failures.
        */

        const retryable =
            status === 403 ||
            status === 429 ||
            status === 500 ||
            status === 502 ||
            status === 503 ||
            status === 504;


        if (
            !retryable ||
            attempt >=
                MAILNOVA_RETRY_DELAYS.length
        ) {

            console.error(
                "MailNova: Gmail page failed permanently:",
                page.error
            );


            return page;

        }


        const delay =
            MAILNOVA_RETRY_DELAYS[
                attempt
            ];


        attempt++;


        console.warn(
            `MailNova: Gmail rate limit/server error ${status}. ` +
            `Retrying in ${delay / 1000}s...`
        );


        await mailnovaDelay(
            delay
        );

    }

}


/* =========================================
   MARK EMAIL AS READ
========================================= */

/*
   Removes the UNREAD label from the
   actual Gmail message.
*/

async function markEmailAsRead(
    messageId
) {

    try {

        if (!messageId) {

            throw new Error(
                "Gmail message ID is required."
            );

        }


        console.log(
            "MailNova: Marking email as READ:",
            messageId
        );


        const response =
            await mailnovaApiFetch(
                `${MAILNOVA_API}/gmail/mark-read`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            message_id:
                                messageId

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Mark as Read API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Email could not be marked as read."
            );

        }


        console.log(
            "MailNova: Email marked as READ successfully:",
            messageId
        );


        return {

            success: true,

            message_id:
                messageId,

            unread: false

        };

    }

    catch (error) {

        console.error(
            "MailNova Mark as Read Error:",
            error
        );


        return {

            success: false,

            message_id:
                messageId,

            unread: true,

            error:
                error.message ||
                "Could not mark email as read."

        };

    }

}


/* =========================================
   MARK EMAIL AS UNREAD
========================================= */

/*
   Adds the UNREAD label to the
   actual Gmail message.
*/

async function markEmailAsUnread(
    messageId
) {

    try {

        if (!messageId) {

            throw new Error(
                "Gmail message ID is required."
            );

        }


        console.log(
            "MailNova: Marking email as UNREAD:",
            messageId
        );


        const response =
            await mailnovaApiFetch(
                `${MAILNOVA_API}/gmail/mark-unread`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            message_id:
                                messageId

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Mark as Unread API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Email could not be marked as unread."
            );

        }


        console.log(
            "MailNova: Email marked as UNREAD successfully:",
            messageId
        );


        return {

            success: true,

            message_id:
                messageId,

            unread: true

        };

    }

    catch (error) {

        console.error(
            "MailNova Mark as Unread Error:",
            error
        );


        return {

            success: false,

            message_id:
                messageId,

            unread: false,

            error:
                error.message ||
                "Could not mark email as unread."

        };

    }

}


/* =========================================
   LOAD EMAIL CACHE
========================================= */

async function loadMailnovaEmailCache() {

    try {

        await ensureMailnovaUserCache();

        const data =
            await chrome.storage.local.get(
                [
                    MAILNOVA_CACHE_KEY,
                    MAILNOVA_CACHE_TIME_KEY,
                    MAILNOVA_CACHE_COMPLETE_KEY,
                    "mailnova_email_cache_version"
                ]
            );


        if (
            data.mailnova_email_cache_version !==
            MAILNOVA_CACHE_VERSION
        ) {

            return {

                emails: [],

                timestamp: 0

            };

        }


        return {

            emails:
                Array.isArray(
                    data[MAILNOVA_CACHE_KEY]
                )
                    ? data[MAILNOVA_CACHE_KEY]
                    : [],

            timestamp:
                Number(
                    data[MAILNOVA_CACHE_TIME_KEY]
                ) || 0,

            complete:
                data[MAILNOVA_CACHE_COMPLETE_KEY] === true

        };

    }

    catch (error) {

        console.error(
            "MailNova Cache Load Error:",
            error
        );


        return {

            emails: [],

            timestamp: 0

        };

    }

}


/* =========================================
   SAVE EMAIL CACHE
========================================= */

async function saveMailnovaEmailCache(
    emails,
    complete = null
) {

    try {

        await ensureMailnovaUserCache();

        const cacheData = {

            [MAILNOVA_CACHE_KEY]:
                emails,

            [MAILNOVA_CACHE_TIME_KEY]:
                Date.now(),

            mailnova_email_cache_version:
                MAILNOVA_CACHE_VERSION

        };

        if (typeof complete === "boolean") {
            cacheData[MAILNOVA_CACHE_COMPLETE_KEY] = complete;
        }

        await chrome.storage.local.set(cacheData);


        console.log(
            "MailNova: Email cache saved:",
            emails.length
        );


        return true;

    }

    catch (error) {

        console.error(
            "MailNova Cache Save Error:",
            error
        );


        return false;

    }

}


/* =========================================
   MERGE EMAILS WITHOUT DUPLICATES
========================================= */

function mergeMailnovaEmails(
    existingEmails,
    newEmails
) {

    const map =
        new Map();


    for (
        const email of
        Array.isArray(existingEmails)
            ? existingEmails
            : []
    ) {

        const id =
            email?.id ||
            email?.threadId;


        if (
            id
        ) {

            map.set(
                id,
                email
            );

        }

    }


    for (
        const email of
        Array.isArray(newEmails)
            ? newEmails
            : []
    ) {

        const id =
            email?.id ||
            email?.threadId;


        if (
            id
        ) {

            const previous = map.get(id) || {};
            map.set(id, {
                ...previous,
                ...email,
                body: email.body || previous.body || "",
                summary: email.summary || previous.summary || "",
                aiCategory: email.aiCategory || previous.aiCategory,
                aiPriority: email.aiPriority || previous.aiPriority,
                aiPriorityScore: email.aiPriorityScore || previous.aiPriorityScore,
                aiSpam: typeof email.aiSpam === "boolean"
                    ? email.aiSpam
                    : previous.aiSpam,
                aiSpamConfidence: email.aiSpamConfidence || previous.aiSpamConfidence,
                aiSpamReason: email.aiSpamReason || previous.aiSpamReason,
                aiPriorityReason: email.aiPriorityReason || previous.aiPriorityReason,
                aiAnalysisComplete: email.aiAnalysisComplete || previous.aiAnalysisComplete || false
            });

        }

    }


    return Array.from(
        map.values()
    );

}


/* =========================================
   FETCH REMAINING GMAIL PAGES
========================================= */

async function fetchRemainingGmailPages(
    firstPage,
    onPage = null
) {

    let allEmails =
        [
            ...(firstPage.emails || [])
        ];


    let nextPageToken =
        firstPage.next_page_token;


    let pageNumber =
        1;


    /*
       Prevent a broken Gmail pagination token
       from causing an infinite loop.
    */

    const usedPageTokens =
        new Set();


    while (
        nextPageToken
    ) {

        if (
            usedPageTokens.has(
                nextPageToken
            )
        ) {

            console.warn(
                "MailNova: Duplicate Gmail page token detected. Stopping pagination."
            );

            break;

        }


        usedPageTokens.add(
            nextPageToken
        );


        pageNumber++;


        console.log(
            `MailNova: Waiting before Gmail page ${pageNumber}...`
        );


        /*
           IMPORTANT:
           Do not hammer Gmail API.
        */

        await mailnovaDelay(
            MAILNOVA_PAGE_DELAY_MS
        );


        console.log(
            `MailNova: Loading Gmail page ${pageNumber}...`
        );


        const page =
            await fetchGmailPageWithRetry(
                nextPageToken,
                MAILNOVA_PAGE_SIZE
            );


        if (
            !page.success
        ) {

            console.error(
                "MailNova: Background Gmail page failed. " +
                "Stopping this sync safely.",
                page.error
            );


            break;

        }


        const pageEmails =
            page.emails || [];


        if (
            pageEmails.length === 0
        ) {

            console.log(
                "MailNova: Gmail returned an empty page. Sync complete."
            );


            break;

        }


        allEmails =
            mergeMailnovaEmails(
                allEmails,
                pageEmails
            );


        /*
           Send each page to workspace immediately.

           This means the user does NOT need to
           wait for all Gmail messages.
        */

        if (
            typeof onPage ===
            "function"
        ) {

            try {

                await onPage(
                    pageEmails,
                    allEmails,
                    page
                );

            }

            catch (callbackError) {

                console.error(
                    "MailNova: Page callback error:",
                    callbackError
                );

            }

        }


        /*
           Save progressively.

           If the browser/extension is closed,
           already downloaded pages remain cached.
        */

        await saveMailnovaEmailCache(
            allEmails
        );


        nextPageToken =
            page.next_page_token;


        /*
           Gmail normally has far fewer than
           200 pages for normal inbox usage.

           This is only a safety guard.
        */

        if (
            pageNumber >= 200
        ) {

            console.warn(
                "MailNova: Gmail pagination safety limit reached."
            );

            break;

        }

    }


    console.log(
        "MailNova: Background Gmail pagination completed:",
        allEmails.length
    );


    return allEmails;

}


/* =========================================
   FETCH ALL GMAIL EMAILS
========================================= */

async function fetchAllGmailEmails(
    onPage = null
) {

    /*
       Prevent multiple parts of MailNova
       from starting the same huge Gmail sync.
    */

    if (
        mailnovaFetchAllPromise
    ) {

        console.log(
            "MailNova: Gmail full sync already running."
        );


        return mailnovaFetchAllPromise;

    }


    mailnovaFetchAllPromise =
        (async () => {

            try {

                /*
                   First page is intentionally small
                   so UI can receive emails quickly.
                */

                const firstPage =
                    await fetchGmailPageWithRetry(
                        null,
                        MAILNOVA_PAGE_SIZE
                    );


                if (
                    !firstPage.success
                ) {

                    console.error(
                        "MailNova: First Gmail page failed."
                    );


                    return {

                        success: false,

                        emails: [],

                        next_page_token:
                            null

                    };

                }


                const firstEmails =
                    firstPage.emails || [];


                /*
                   Give the first page to the workspace
                   immediately.
                */

                if (
                    typeof onPage ===
                    "function"
                ) {

                    try {

                        await onPage(
                            firstEmails,
                            firstEmails,
                            firstPage
                        );

                    }

                    catch (callbackError) {

                        console.error(
                            "MailNova: First page callback error:",
                            callbackError
                        );

                    }

                }


                /*
                   Save first page immediately.
                */

                await saveMailnovaEmailCache(
                    firstEmails
                );


                /*
                   Continue automatically in the
                   background.
                */

                const allEmails =
                    await fetchRemainingGmailPages(
                        firstPage,
                        onPage
                    );


                return {

                    success: true,

                    emails:
                        allEmails

                };

            }

            catch (error) {

                console.error(
                    "MailNova: Gmail full sync error:",
                    error
                );


                return {

                    success: false,

                    emails: [],

                    error:
                        error.message ||
                        "Gmail sync failed"

                };

            }

            finally {

                mailnovaFetchAllPromise =
                    null;

            }

        })();


    return mailnovaFetchAllPromise;

}


/* =========================================
   SUMMARY CACHE
========================================= */

const MAILNOVA_SUMMARY_CACHE_KEY =
    "mailnova_summaries";

const MAILNOVA_AUTO_SUMMARY_USAGE_KEY =
    "mailnova_auto_summary_daily_usage";

// Leave room for other AI features on accounts with limited daily quota.
const MAILNOVA_AUTO_SUMMARY_DAILY_LIMIT = 5;

let mailnovaSummaryQueueRunning = false;


function getMailnovaSummaryDayKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}


async function restoreMailnovaSummaryCache(emails) {
    if (!Array.isArray(emails) || !emails.length) {
        return false;
    }

    try {
        await ensureMailnovaUserCache();
        const saved = await chrome.storage.local.get(
            MAILNOVA_SUMMARY_CACHE_KEY
        );
        const summaries = saved[MAILNOVA_SUMMARY_CACHE_KEY] || {};
        let changed = false;

        for (const email of emails) {
            const emailId = String(email?.id || email?.threadId || "");
            if (!emailId) {
                continue;
            }

            if (email.summary) {
                if (!summaries[emailId]) {
                    summaries[emailId] = email.summary;
                    changed = true;
                }
            }
            else if (summaries[emailId]) {
                email.summary = summaries[emailId];
            }
        }

        if (changed) {
            await chrome.storage.local.set({
                [MAILNOVA_SUMMARY_CACHE_KEY]: summaries
            });
        }

        return changed;
    }
    catch (error) {
        console.warn("MailNova: Summary cache restore failed:", error);
        return false;
    }
}


async function startMailnovaSummaryGeneration(emails, onSummarySaved) {
    if (
        mailnovaSummaryQueueRunning ||
        !Array.isArray(emails) ||
        !emails.length
    ) {
        return;
    }

    mailnovaSummaryQueueRunning = true;

    try {
        await ensureMailnovaUserCache();
        await restoreMailnovaSummaryCache(emails);

        const candidates = emails.filter(email =>
            email &&
            (email.id || email.threadId) &&
            !email.summary &&
            (email.body || email.snippet)
        );

        if (!candidates.length) {
            return;
        }

        const dayKey = getMailnovaSummaryDayKey();
        const savedUsage = await chrome.storage.local.get(
            MAILNOVA_AUTO_SUMMARY_USAGE_KEY
        );
        let usage = savedUsage[MAILNOVA_AUTO_SUMMARY_USAGE_KEY];

        if (!usage || usage.day !== dayKey) {
            usage = { day: dayKey, attempts: 0 };
        }

        const remaining = Math.max(
            0,
            MAILNOVA_AUTO_SUMMARY_DAILY_LIMIT - Number(usage.attempts || 0)
        );

        if (!remaining) {
            console.log(
                `MailNova: Daily automatic summary limit (${MAILNOVA_AUTO_SUMMARY_DAILY_LIMIT}) reached; saved summaries remain available.`
            );
            return;
        }

        for (const email of candidates.slice(0, remaining)) {
            usage.attempts = Number(usage.attempts || 0) + 1;
            await chrome.storage.local.set({
                [MAILNOVA_AUTO_SUMMARY_USAGE_KEY]: usage
            });

            try {
                const summary = await summarizeEmail(email);
                if (!summary) {
                    break;
                }

                email.summary = summary;
                if (typeof onSummarySaved === "function") {
                    await onSummarySaved(email, summary);
                }
            }
            catch (error) {
                console.warn(
                    "MailNova: Automatic summary generation stopped after an API error:",
                    error
                );
                break;
            }
        }
    }
    catch (error) {
        console.warn("MailNova: Automatic summary queue failed:", error);
    }
    finally {
        mailnovaSummaryQueueRunning = false;
    }
}

async function summarizeEmail(
    email
) {

    try {

        await ensureMailnovaUserCache();

        const saved =
            await chrome.storage.local.get(
                [
                    MAILNOVA_SUMMARY_CACHE_KEY
                ]
            );


        const summaries =
            saved[MAILNOVA_SUMMARY_CACHE_KEY] ||
            {};


        const emailId =
            email.id ||
            email.threadId;


        if (
            emailId &&
            summaries[emailId]
        ) {

            console.log(
                "MailNova: Using cached summary:",
                emailId
            );


            return summaries[emailId];

        }


        console.log(
            "MailNova: Generating new summary:",
            emailId
        );


        const response =
            await mailnovaApiFetch(
                `${MAILNOVA_API}/summarize`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            sender:
                                email.sender ||
                                "Unknown sender",

                            subject:
                                email.subject ||
                                "No subject",

                            body:
                                (email.body || email.snippet || "")
                                    .slice(0, 4000)

                        })

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Summary API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                "Summary generation failed"
            );

        }


        const summary =
            data.summary ||
            "";


        if (
            emailId &&
            summary
        ) {

            summaries[emailId] =
                summary;


            await chrome.storage.local.set({

                [MAILNOVA_SUMMARY_CACHE_KEY]: summaries

            });

        }


        return summary;

    }

    catch (error) {

        console.error(
            "MailNova Summary Error:",
            error
        );


        throw error;

    }

}

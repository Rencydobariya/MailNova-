const MAILNOVA_API =
    "https://mailnova-9tzz.onrender.com";


/* =========================================
   GMAIL PAGINATION SETTINGS
========================================= */

const MAILNOVA_PAGE_SIZE =
    25;


/*
   Gmail quota protection.

   25 full Gmail messages can consume a
   significant amount of Gmail API quota.

   We therefore wait between pages instead
   of hammering Gmail continuously.
*/
const MAILNOVA_PAGE_DELAY_MS =
    6000;


/*
   Retry delays for Gmail 403 / 429 errors.
*/
const MAILNOVA_RETRY_DELAYS = [
    10000,
    20000,
    40000
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


const MAILNOVA_CACHE_VERSION =
    2;


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
            await fetch(
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
            await fetch(
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
            await fetch(
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

        const data =
            await chrome.storage.local.get(
                [
                    MAILNOVA_CACHE_KEY,
                    MAILNOVA_CACHE_TIME_KEY,
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
                ) || 0

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
    emails
) {

    try {

        await chrome.storage.local.set({

            [MAILNOVA_CACHE_KEY]:
                emails,

            [MAILNOVA_CACHE_TIME_KEY]:
                Date.now(),

            mailnova_email_cache_version:
                MAILNOVA_CACHE_VERSION

        });


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

            /*
               New Gmail data wins.
            */

            map.set(
                id,
                email
            );

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

async function summarizeEmail(
    email
) {

    try {

        const saved =
            await chrome.storage.local.get(
                [
                    "mailnova_summaries"
                ]
            );


        const summaries =
            saved.mailnova_summaries ||
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
            await fetch(
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
                                email.body ||
                                email.snippet ||
                                ""

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

                mailnova_summaries:
                    summaries

            });

        }


        return summary;

    }

    catch (error) {

        console.error(
            "MailNova Summary Error:",
            error
        );


        return "";

    }

}
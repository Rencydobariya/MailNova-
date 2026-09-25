const MAILNOVA_API =
    "https://mailnova-9tzz.onrender.com";

const MAILNOVA_PAGE_SIZE =
    25;

const MAILNOVA_PAGE_DELAY_MS =
    700;

let mailnovaFetchAllPromise =
    null;

const MAILNOVA_CACHE_KEY =
    "mailnova_email_cache";

const MAILNOVA_CACHE_TIME_KEY =
    "mailnova_email_cache_time";

const MAILNOVA_CACHE_VERSION =
    2;


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

            throw new Error(
                `Gmail API failed: ${response.status}`
            );

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

            next_page_token: null

        };

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
   FETCH REMAINING GMAIL PAGES
========================================= */

/* =========================================
   FETCH REMAINING GMAIL PAGES
========================================= */

function mailnovaWait(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );

}


function mailnovaMergeEmails(
    currentEmails,
    newEmails
) {

    const merged = [
        ...(currentEmails || [])
    ];


    const existingIds =
        new Set(
            merged
                .map(
                    email =>
                        email?.id ||
                        email?.threadId
                )
                .filter(Boolean)
        );


    for (
        const email
        of (newEmails || [])
    ) {

        const emailId =
            email?.id ||
            email?.threadId;


        if (
            !emailId ||
            !existingIds.has(emailId)
        ) {

            merged.push(
                email
            );


            if (emailId) {

                existingIds.add(
                    emailId
                );

            }

        }

    }


    return merged;

}


/* =========================================
   FETCH REMAINING GMAIL PAGES
========================================= */

async function fetchRemainingGmailPages(
    firstPage,
    onPage = null,
    startingEmails = []
) {

    let allEmails =
        mailnovaMergeEmails(
            startingEmails,
            firstPage.emails || []
        );


    let nextPageToken =
        firstPage.next_page_token;


    let pageNumber = 1;


    while (
        nextPageToken
    ) {

        /*
           Small controlled delay between pages.

           This prevents Gmail API request bursts
           while keeping loading automatic.
        */

        await mailnovaWait(
            MAILNOVA_PAGE_DELAY_MS
        );


        pageNumber++;


        console.log(
            `MailNova: Loading Gmail page ${pageNumber}...`
        );


        const page =
            await fetchGmailEmails(
                nextPageToken,
                MAILNOVA_PAGE_SIZE
            );


        if (
            !page.success
        ) {

            console.warn(
                "MailNova: Background Gmail page failed. " +
                "Already loaded emails will remain visible."
            );

            break;

        }


        const pageEmails =
            page.emails || [];


        if (
            pageEmails.length === 0
        ) {

            break;

        }


        allEmails =
            mailnovaMergeEmails(
                allEmails,
                pageEmails
            );


        /*
           IMPORTANT:

           Send every page to workspace immediately.
           User does NOT need to click Load More.
        */

        if (
            typeof onPage ===
            "function"
        ) {

            await onPage(
                pageEmails,
                allEmails,
                page
            );

        }


        /*
           Save cache after every page.
        */

        await saveMailnovaEmailCache(
            allEmails
        );


        nextPageToken =
            page.next_page_token;


        /*
           Safety guard.
        */

        if (
            pageNumber > 200
        ) {

            console.warn(
                "MailNova: Gmail pagination safety limit reached."
            );

            break;

        }

    }


    return allEmails;

}


/* =========================================
   FETCH ALL GMAIL EMAILS
========================================= */

async function fetchAllGmailEmails(
    onPage = null
) {

    /*
       Prevent duplicate Gmail loading.

       If MailNova accidentally calls this function
       twice at the same time, both calls reuse the
       same request.
    */

    if (
        mailnovaFetchAllPromise
    ) {

        console.log(
            "MailNova: Gmail fetch already running. Reusing it."
        );


        return mailnovaFetchAllPromise;

    }


    mailnovaFetchAllPromise =
        (async () => {

            /*
               STEP 1
               SHOW CACHE FIRST

               Existing emails appear immediately.
            */

            const cached =
                await loadMailnovaEmailCache();


            const cachedEmails =
                cached.emails || [];


            if (
                cachedEmails.length > 0 &&
                typeof onPage ===
                "function"
            ) {

                console.log(
                    "MailNova: Showing cached emails immediately:",
                    cachedEmails.length
                );


                await onPage(
                    cachedEmails,
                    cachedEmails,
                    {
                        success: true,
                        emails: cachedEmails,
                        next_page_token: null,
                        fromCache: true
                    }
                );

            }


            /*
               STEP 2
               FETCH FIRST 25 FRESH EMAILS

               This makes the first screen fast.
            */

            const firstPage =
                await fetchGmailEmails(
                    null,
                    MAILNOVA_PAGE_SIZE
                );


            if (
                !firstPage.success
            ) {

                /*
                   If Gmail is temporarily rate limited,
                   keep cached emails visible.
                */

                if (
                    cachedEmails.length > 0
                ) {

                    console.warn(
                        "MailNova: Gmail refresh failed. " +
                        "Keeping cached emails visible."
                    );


                    return {
                        success: true,
                        emails: cachedEmails,
                        fromCache: true
                    };

                }


                return {
                    success: false,
                    emails: []
                };

            }


            const freshEmails =
                firstPage.emails || [];


            /*
               Fresh emails first.
               Cached emails are added without duplicates.
            */

            const mergedFirstPage =
                mailnovaMergeEmails(
                    freshEmails,
                    cachedEmails
                );


            if (
                typeof onPage ===
                "function"
            ) {

                await onPage(
                    freshEmails,
                    mergedFirstPage,
                    firstPage
                );

            }


            await saveMailnovaEmailCache(
                mergedFirstPage
            );


            /*
               STEP 3
               AUTOMATIC BACKGROUND PAGINATION

               No Load More button.
               Pages arrive automatically.
            */

            const allEmails =
                await fetchRemainingGmailPages(
                    firstPage,
                    onPage,
                    mergedFirstPage
                );


            await saveMailnovaEmailCache(
                allEmails
            );


            return {
                success: true,
                emails: allEmails
            };

        })();


    try {

        return await mailnovaFetchAllPromise;

    }

    finally {

        mailnovaFetchAllPromise =
            null;

    }

}
/* =========================================
   FETCH ALL GMAIL EMAILS
========================================= */

async function fetchAllGmailEmails(
    onPage = null
) {

    const firstPage =
        await fetchGmailEmails(
            null,
            MAILNOVA_PAGE_SIZE
        );


    if (
        !firstPage.success
    ) {

        return {

            success: false,

            emails: []

        };

    }


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
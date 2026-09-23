const MAILNOVA_API =
    "http://127.0.0.1:8000";

const MAILNOVA_PAGE_SIZE =
    100;

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

async function fetchRemainingGmailPages(
    firstPage,
    onPage = null
) {

    let allEmails = [
        ...(firstPage.emails || [])
    ];


    let nextPageToken =
        firstPage.next_page_token;


    let pageNumber = 1;


    while (
        nextPageToken
    ) {

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

            console.error(
                "MailNova: Background Gmail page failed."
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


        allEmails.push(
            ...pageEmails
        );


        /*
           Send each page to workspace immediately.
           User does not wait for all 2000 emails.
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


        nextPageToken =
            page.next_page_token;


        /*
           Safety guard against an accidental
           repeated page token.
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
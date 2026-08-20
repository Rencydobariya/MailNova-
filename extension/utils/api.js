const MAILNOVA_API = "http://127.0.0.1:8000";

async function fetchGmailEmails(pageToken = null) {

    try {

        let url =
            `${MAILNOVA_API}/gmail/emails?max_results=100`;

        if (pageToken) {

            url +=
                `&page_token=${encodeURIComponent(pageToken)}`;

        }

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Gmail API failed: ${response.status}`
            );

        }

        const data = await response.json();

        if (!data.success) {

            throw new Error(
                "Gmail emails could not be fetched"
            );

        }

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

async function summarizeEmail(email) {

    try {

        /* =========================================
           CHECK SAVED SUMMARY
        ========================================= */

        const saved =
            await chrome.storage.local.get(
                ["mailnova_summaries"]
            );

        const summaries =
            saved.mailnova_summaries || {};

        const emailId =
            email.id || email.threadId;

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


        /* =========================================
           GENERATE NEW SUMMARY
        ========================================= */

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

                    body: JSON.stringify({

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


        if (!response.ok) {

            throw new Error(
                `Summary API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Summary generation failed"
            );

        }


        const summary =
            data.summary || "";


        /* =========================================
           SAVE SUMMARY
        ========================================= */

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

            console.log(
                "MailNova: Summary saved:",
                emailId
            );

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
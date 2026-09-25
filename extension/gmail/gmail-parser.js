/* =========================================
   GMAIL PARSER
========================================= */

async function getInboxEmails() {

    try {

        const data =
            await fetchGmailEmails();


        if (!data.success) {

            console.error(
                "MailNova: Gmail emails could not be loaded."
            );

            return [];

        }


        const emails =
            (data.emails || []).map(
                (email, index) => {

                    /*
                       Category Detection is controlled
                       by MailNova Settings.

                       If disabled:
                       - Preserve category received from backend
                       - Do not run detectCategory()
                    */

                    let category =
                        email.category ||
                        "Personal";


                    const categoryDetectionEnabled =
                        typeof mailnovaSettings === "undefined" ||
                        mailnovaSettings.categoryDetection !== false;


                    if (
                        categoryDetectionEnabled &&
                        typeof detectCategory === "function"
                    ) {

                        category =
                            detectCategory({

                                sender:
                                    email.sender ||
                                    "",

                                subject:
                                    email.subject ||
                                    "",

                                snippet:
                                    email.snippet ||
                                    ""

                            });

                    }


                    return {

                        id:
                            email.id,

                        threadId:
                            email.threadId ||
                            "",

                        sender:
                            email.sender ||
                            "",

                        subject:
                            email.subject ||
                            "",

                        snippet:
                            email.snippet ||
                            "",

                        /*
                           Preserve full body if backend
                           provides it.

                           Current backend/parser may not
                           provide body yet, so snippet
                           remains the fallback.
                        */

                        body:
                            email.body ||
                            "",

                        date:
                            email.date ||
                            "",

                        unread:
                            email.unread ||
                            false,

                        starred:
                            email.starred ||
                            false,

                        important:
                            email.important ||
                            false,

                        spam:
                            Boolean(
                                email.spam
                            ),

                        category:
                            category

                    };

                }
            );


        const spamCount =
            emails.filter(
                email =>
                    Boolean(email.spam)
            ).length;

        console.log(
            "MailNova: Gmail API emails loaded:",
            emails.length,
            "| Spam detected:",
            spamCount
        );


        return emails;

    }

    catch (error) {

        console.error(
            "MailNova Gmail Parser Error:",
            error
        );

        return [];

    }

}
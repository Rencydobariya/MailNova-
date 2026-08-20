async function getInboxEmails() {

    try {

        const data = await fetchGmailEmails();

        if (!data.success) {

            console.error(
                "MailNova: Gmail emails could not be loaded."
            );

            return [];
        }

        const emails = data.emails.map((email, index) => {

            return {

                id: email.id,

                threadId: email.threadId || "",

                sender: email.sender || "",

                subject: email.subject || "",

                snippet: email.snippet || "",

                date: email.date || "",

                unread: email.unread || false,

                starred: email.starred || false,

                important: email.important || false,

                category: detectCategory({

                    sender: email.sender || "",

                    subject: email.subject || "",

                    snippet: email.snippet || ""

                })

            };

        });

        console.log(
            "MailNova: Gmail API emails loaded:",
            emails.length
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
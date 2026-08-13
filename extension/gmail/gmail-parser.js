

function getInboxEmails() {

    const rows = document.querySelectorAll("tr.zA");

    const emails = [];

    rows.forEach((row, index) => {

        if (index >= 100)
            return;

        const sender =
            row.querySelector(".yP")?.innerText || "";

        const subject =
            row.querySelector(".bog")?.innerText || "";

        const snippet =
            row.querySelector(".y2")?.innerText
                .replace("-", "")
                .trim() || "";

        const date =
            row.querySelector(".xW span")?.getAttribute("title") ||
            row.querySelector(".xW")?.innerText ||
            "";

        const unread =
            row.classList.contains("zE");

        const starred =
            row.querySelector(".T-KT")?.getAttribute("aria-checked") === "true";

        const important =
            row.querySelector(".aKz") !== null;

        const threadId =
            row.getAttribute("data-legacy-thread-id") || "";
            console.log("MailNova Thread ID:", threadId);

        emails.push({

            id: index,

            threadId,

            sender,

            subject,

            snippet,

            date,

            unread,

            starred,

            important,

            category: detectCategory({

            sender,

            subject,

            snippet

                    }),

        });

    });

    return emails;

}
let workspace = null;

let mailnovaEmails = [];


/* =========================================
   CREATE WORKSPACE
========================================= */

async function createWorkspace() {

    if (document.getElementById("mailnova-workspace")) {
        return;
    }

    workspace = document.createElement("div");

    workspace.id = "mailnova-workspace";

    workspace.innerHTML = `

        ${renderHeader()}

        ${renderSearch()}

        ${renderCategoryBar()}

        ${renderEmailList()}

        <div id="mailnova-resizer"></div>

    `;

    document.body.appendChild(workspace);

    enableWorkspaceResize(workspace);


    /* =========================================
   HEADER CONTROLS
========================================= */

document
    .getElementById("mn-refresh")
    .addEventListener(
        "click",
        refreshWorkspace
    );

document
    .getElementById("mn-close")
    .addEventListener(
        "click",
        closeWorkspace
    );

document
    .getElementById("mn-width-plus")
    .addEventListener(
        "click",
        increaseWidth
    );

document
    .getElementById("mn-width-minus")
    .addEventListener(
        "click",
        decreaseWidth
    );


    /* =========================================
       LOAD GMAIL API EMAILS
    ========================================= */

    const result = await fetchGmailEmails();

    if (!result.success) {

        console.error(
            "MailNova: Gmail emails could not be loaded."
        );

        return;
    }

mailnovaEmails = (result.emails || []).map((email, index) => {

    return {

        ...email,

        // MailNova UI ke liye local ID
        uiId: index,

        // Email ko category assign karo
        category: detectCategory({

            sender: email.sender || "",

            subject: email.subject || "",

            snippet: email.snippet || ""

        })

    };

});


    console.log(
        "MailNova Gmail API emails:",
        mailnovaEmails.length
    );


    /* =========================================
       INITIAL SORT
    ========================================= */

    sortEmailsByPriority(mailnovaEmails);


    renderEmails(mailnovaEmails);


    /* =========================================
       CATEGORY COUNTS
    ========================================= */

    const counts =
        getCategoryCounts(mailnovaEmails);


    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    bar.innerHTML = `

        <div
            class="mailnova-chip active"
            data-category="All">

            📥 All (${counts.All})

        </div>

        <div
            class="mailnova-chip"
            data-category="Work">

            💼 Work (${counts.Work})

        </div>

        <div
            class="mailnova-chip"
            data-category="Education">

            🎓 Education (${counts.Education})

        </div>

        <div
            class="mailnova-chip"
            data-category="Shopping">

            🛒 Shopping (${counts.Shopping})

        </div>

        <div
            class="mailnova-chip"
            data-category="Banking">

            💳 Banking (${counts.Banking})

        </div>

        <div
            class="mailnova-chip"
            data-category="Personal">

            👤 Personal (${counts.Personal})

        </div>

    `;


    /* =========================================
       CATEGORY FILTER
    ========================================= */

    document
        .querySelectorAll(".mailnova-chip")
        .forEach(chip => {

            chip.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".mailnova-chip"
                        )
                        .forEach(c =>
                            c.classList.remove(
                                "active"
                            )
                        );


                    chip.classList.add("active");


                    const category =
                        chip.dataset.category;


                    const filtered =
                        filterEmails(
                            mailnovaEmails,
                            category
                        );


                    sortEmailsByPriority(
                        filtered
                    );


                    renderEmails(filtered);

                }
            );

        });

setupEmailSearch();
setupMonthFilter();


    /* =========================================
       ASK AI + VIEW BUTTONS
    ========================================= */

    workspace.addEventListener(
        "click",
        (e) => {


/* =========================
    VIEW BUTTON
========================= */

const viewButton =
    e.target.closest(".mn-view");

if (viewButton) {

    e.preventDefault();
    e.stopPropagation();

    const emailId =
        viewButton.dataset.id;

    const email =
        mailnovaEmails.find(
            mail => mail.id === emailId
        );

    if (!email) {

        console.log(
            "MailNova: Email not found",
            emailId
        );

        return;

    }

    const threadId =
        email.threadId;

    if (!threadId) {

        console.log(
            "MailNova: Thread ID not found",
            email
        );

        return;

    }

    console.log(
        "MailNova: Opening Gmail thread:",
        threadId
    );

    /*
       Open the exact Gmail thread
       using Gmail's thread ID.
    */

   workspace.style.width = "400px";

setTimeout(() => {

    window.location.hash =
        `all/${threadId}`;

}, 150);

}


            /* =========================
               ASK AI BUTTON
            ========================= */

            const askAIButton =
                e.target.closest(".mn-ai");


            if (askAIButton) {

                e.preventDefault();

                e.stopPropagation();


                const emailId =
                    askAIButton.dataset.id;


                const email =
                    mailnovaEmails.find(
                        mail =>
                            mail.id === emailId
                    );


                if (!email) {

                    console.log(
                        "MailNova: Email not found",
                        emailId
                    );

                    return;

                }


                console.log(
                    "MailNova: Opening Ask AI:",
                    email
                );


                openAskAI(email);


                return;

            }

        }
    );


    /* =========================================
       REFRESH
    ========================================= */

    document
        .getElementById("mn-refresh")
        .addEventListener(
            "click",
            refreshWorkspace
        );


    /* =========================================
       CLOSE
    ========================================= */

    document
        .getElementById("mn-close")
        .addEventListener(
            "click",
            closeWorkspace
        );


    /* =========================================
       WIDTH CONTROLS
    ========================================= */

    document
        .getElementById("mn-width-plus")
        .addEventListener(
            "click",
            increaseWidth
        );


    document
        .getElementById("mn-width-minus")
        .addEventListener(
            "click",
            decreaseWidth
        );

}


/* =========================================
   CLOSE
========================================= */

function closeWorkspace() {

    if (workspace) {

        workspace.remove();

        workspace = null;

    }

}


/* =========================================
   MINIMIZE
========================================= */

function minimizeWorkspace() {

    if (!workspace) return;

    workspace.style.display = "none";

}


/* =========================================
   RESTORE
========================================= */

function restoreWorkspace() {

    if (!workspace) return;


    if (workspace.style.display === "none") {

        workspace.style.display = "flex";

    }

    else {

        workspace.style.display = "none";

    }

}
/* =========================================
   REFRESH WORKSPACE
========================================= */

async function refreshWorkspace() {

    const button =
        document.getElementById("mn-refresh");

    if (!button) return;


    /* Refresh animation */

    button.style.transition =
        "transform .5s ease";

    button.style.transform =
        "rotate(360deg)";


    setTimeout(() => {

        button.style.transform =
            "rotate(0deg)";

    }, 500);


    /* Fetch latest Gmail emails */

    const result =
        await fetchGmailEmails();


    if (!result.success) {

        console.error(
            "MailNova: Refresh failed"
        );

        return;

    }


    /* Rebuild email data */

    mailnovaEmails =
        (result.emails || []).map(
            (email, index) => {

                return {

                    ...email,

                    uiId: index,

                    category:
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

                        })

                };

            }
        );


    /* Sort */

    sortEmailsByPriority(
        mailnovaEmails
    );


    /* Render */

  const searchInput =
    document.getElementById(
        "mailnova-search-input"
    );

const searchQuery =
    searchInput
        ? searchInput.value.trim()
        : "";


if (searchQuery) {

    performEmailSearch(
        searchQuery
    );

} else {

    renderEmails(
        mailnovaEmails
    );

}


    /* Update category counts */

    const counts =
        getCategoryCounts(
            mailnovaEmails
        );


    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    if (!bar) return;


    bar.innerHTML = `

        <div
            class="mailnova-chip active"
            data-category="All">

            📥 All (${counts.All})

        </div>

        <div
            class="mailnova-chip"
            data-category="Work">

            💼 Work (${counts.Work})

        </div>

        <div
            class="mailnova-chip"
            data-category="Education">

            🎓 Education (${counts.Education})

        </div>

        <div
            class="mailnova-chip"
            data-category="Shopping">

            🛒 Shopping (${counts.Shopping})

        </div>

        <div
            class="mailnova-chip"
            data-category="Banking">

            💳 Banking (${counts.Banking})

        </div>

        <div
            class="mailnova-chip"
            data-category="Personal">

            👤 Personal (${counts.Personal})

        </div>

    `;


    /* Reconnect category buttons */

    document
        .querySelectorAll(
            ".mailnova-chip"
        )
        .forEach(chip => {

            chip.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".mailnova-chip"
                        )
                        .forEach(c =>
                            c.classList.remove(
                                "active"
                            )
                        );


                    chip.classList.add(
                        "active"
                    );


                    const category =
                        chip.dataset.category;


                    const filtered =
                        filterEmails(
                            mailnovaEmails,
                            category
                        );


                    sortEmailsByPriority(
                        filtered
                    );


                    renderEmails(
                        filtered
                    );

                }
            );

        });


    console.log(
        "MailNova: Workspace refreshed:",
        mailnovaEmails.length,
        "emails"
    );

}
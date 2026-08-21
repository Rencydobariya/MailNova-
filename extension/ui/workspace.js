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

    const refreshButton =
        document.getElementById("mn-refresh");

    const closeButton =
        document.getElementById("mn-close");

    const widthPlusButton =
        document.getElementById("mn-width-plus");

    const widthMinusButton =
        document.getElementById("mn-width-minus");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshWorkspace
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeWorkspace
        );

    }


    if (widthPlusButton) {

        widthPlusButton.addEventListener(
            "click",
            increaseWidth
        );

    }


    if (widthMinusButton) {

        widthMinusButton.addEventListener(
            "click",
            decreaseWidth
        );

    }


    /* =========================================
       LOAD GMAIL API EMAILS
    ========================================= */

    const result =
        await fetchGmailEmails();


    if (!result.success) {

        console.error(
            "MailNova: Gmail emails could not be loaded."
        );

        return;

    }


    /* =========================================
       BUILD EMAIL DATA
    ========================================= */

    mailnovaEmails =
        (result.emails || []).map(
            (email, index) => {

                return {

                    ...email,

                    uiId: index,

                    category:
                        detectCategory({

                            sender:
                                email.sender || "",

                            subject:
                                email.subject || "",

                            snippet:
                                email.snippet || ""

                        })

                };

            }
        );


    console.log(
        "MailNova Gmail API emails:",
        mailnovaEmails.length
    );


    /* =========================================
       INITIAL SORT
    ========================================= */

    sortEmailsByPriority(
        mailnovaEmails
    );


    /* =========================================
       RENDER EMAILS
    ========================================= */

    renderEmails(
        mailnovaEmails
    );


    /* =========================================
       CATEGORY BAR
    ========================================= */

    updateCategoryBarWithSort(
        mailnovaEmails
    );


    /* =========================================
       CATEGORY FILTER
    ========================================= */

    setupCategoryFilter();


    /* =========================================
       SEARCH
    ========================================= */

    setupEmailSearch();


    /* =========================================
       MONTH FILTER
    ========================================= */

    setupMonthFilter();


    /* =========================================
       SORT
    ========================================= */

    setupSortMenu();


    /* =========================================
       ASK AI + VIEW BUTTONS
    ========================================= */

    setupEmailActions();

}


/* =========================================
   CATEGORY BAR + SORT
========================================= */

function updateCategoryBarWithSort(emails) {

    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    if (!bar) return;


    const counts =
        getCategoryCounts(emails);


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


        <div class="mailnova-sort-wrapper">

            <button
                id="mailnova-sort-btn"
                class="mailnova-sort-btn"
                type="button">

                ↕ Sort

            </button>


            <div
                id="mailnova-sort-menu"
                class="mailnova-sort-menu">

                <div
                    class="mailnova-sort-option active"
                    data-sort="priority">

                    ⭐ Priority

                </div>


                <div
                    class="mailnova-sort-option"
                    data-sort="newest">

                    🕐 Newest

                </div>


                <div
                    class="mailnova-sort-option"
                    data-sort="oldest">

                    🕐 Oldest

                </div>


                <div
                    class="mailnova-sort-option"
                    data-sort="az">

                    🔤 Sender A–Z

                </div>


                <div
                    class="mailnova-sort-option"
                    data-sort="za">

                    🔤 Sender Z–A

                </div>

            </div>

        </div>

    `;

}


/* =========================================
   CATEGORY FILTER
========================================= */

function setupCategoryFilter() {

    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    if (!bar) return;


    bar
        .querySelectorAll(".mailnova-chip")
        .forEach(chip => {

            chip.addEventListener(
                "click",
                () => {

                    bar
                        .querySelectorAll(
                            ".mailnova-chip"
                        )
                        .forEach(c => {

                            c.classList.remove(
                                "active"
                            );

                        });


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

}


/* =========================================
   SORT MENU
========================================= */

function setupSortMenu() {

    const sortButton =
        document.getElementById(
            "mailnova-sort-btn"
        );


    const sortMenu =
        document.getElementById(
            "mailnova-sort-menu"
        );


    if (
        !sortButton ||
        !sortMenu
    ) {

        console.log(
            "MailNova: Sort menu not found."
        );

        return;

    }
    document.body.appendChild(sortMenu);

console.log(
    "MailNova: Sort button found",
    sortButton
);

console.log(
    "MailNova: Sort menu found",
    sortMenu
);


    /* =========================================
       OPEN / CLOSE SORT MENU
    ========================================= */

    sortButton.addEventListener(
        "click",
        (e) => {
            
            console.log(
    "MailNova: SORT BUTTON CLICKED"
);

            e.preventDefault();

            e.stopPropagation();


            const isOpen =
                sortMenu.classList.contains(
                    "open"
                );


            if (isOpen) {

                sortMenu.classList.remove(
                    "open"
                );

                return;

            }


            /*
               Fixed dropdown ko Sort button
               ke exact neeche position karo.
            */

            const rect =
                sortButton.getBoundingClientRect();


            sortMenu.style.top =
                (rect.bottom + 8) + "px";


            sortMenu.style.left =
                (rect.right - 190) + "px";


            sortMenu.classList.add(
                "open"
            );

            console.log(
    "SORT OPEN CLASS:",
    sortMenu.classList.contains("open")
);

console.log(
    "SORT DISPLAY:",
    getComputedStyle(sortMenu).display
);
 
        }
        


        
    );


    /* =========================================
       SORT OPTIONS
    ========================================= */

    sortMenu
        .querySelectorAll(
            ".mailnova-sort-option"
        )
        .forEach(option => {

            option.addEventListener(
                "click",
                (e) => {

                    e.preventDefault();

                    e.stopPropagation();


                    const sortType =
                        option.dataset.sort;


                    sortMenu
                        .querySelectorAll(
                            ".mailnova-sort-option"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    option.classList.add(
                        "active"
                    );


                    sortMenu.classList.remove(
                        "open"
                    );


                    applyMailnovaSort(
                        sortType
                    );

                }
            );

        });


    /* =========================================
       CLOSE WHEN CLICKING OUTSIDE
    ========================================= */

    document.addEventListener(
        "click",
        (e) => {

            if (
                !sortMenu.contains(e.target) &&
                e.target !== sortButton
            ) {

                sortMenu.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================================
   EMAIL ACTIONS
========================================= */

function setupEmailActions() {

    if (!workspace) return;


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
                   Gmail workspace ko refresh kiye bina
                   exact thread open karega.
                */

                if (workspace) {

                    workspace.style.width =
                        "400px";

                }


                setTimeout(
                    () => {

                        window.location.hash =
                            `all/${threadId}`;

                    },
                    150
                );


                return;

            }



            /* =========================
   REPLY BUTTON
========================= */

const replyButton =
    e.target.closest(".mn-reply");

if (replyButton) {

    e.preventDefault();
    e.stopPropagation();

    const emailId =
        replyButton.dataset.id;

    const email =
        mailnovaEmails.find(
            mail => String(mail.id) === String(emailId)
        );

    if (!email) {

        console.log(
            "MailNova: Reply email not found",
            emailId
        );

        return;

    }

    console.log(
        "MailNova: Opening Reply Composer:",
        email
    );

    openReplyComposer(email);

    return;

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


                openAskAI(
                    email
                );


                return;

            }

        }
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


    workspace.style.display =
        "none";

}


/* =========================================
   RESTORE
========================================= */

function restoreWorkspace() {

    if (!workspace) return;


    if (
        workspace.style.display ===
        "none"
    ) {

        workspace.style.display =
            "flex";

    }

    else {

        workspace.style.display =
            "none";

    }

}


/* =========================================
   INCREASE WIDTH
========================================= */

function increaseWidth() {

    if (!workspace) return;


    const currentWidth =
        workspace.offsetWidth;


    const newWidth =
        Math.min(
            currentWidth + 50,
            1300
        );


    workspace.style.width =
        newWidth + "px";

}


/* =========================================
   DECREASE WIDTH
========================================= */

function decreaseWidth() {

    if (!workspace) return;


    const currentWidth =
        workspace.offsetWidth;


    const newWidth =
        Math.max(
            currentWidth - 50,
            300
        );


    workspace.style.width =
        newWidth + "px";

}


/* =========================================
   RENDER EMAILS
========================================= */

function renderEmails(emailList) {

    const container =
        document.querySelector(
            ".mailnova-email-list"
        );


    if (!container) return;


    container.innerHTML =
        emailList
            .map(createEmailCard)
            .join("");

}


/* =========================================
   REFRESH WORKSPACE
========================================= */

async function refreshWorkspace() {

    const button =
        document.getElementById(
            "mn-refresh"
        );


    if (!button) return;


    /* =========================================
       REFRESH ANIMATION
    ========================================= */

    button.style.transition =
        "transform .5s ease";


    button.style.transform =
        "rotate(360deg)";


    setTimeout(
        () => {

            button.style.transform =
                "rotate(0deg)";

        },
        500
    );


    /* =========================================
       FETCH LATEST EMAILS
    ========================================= */

    const result =
        await fetchGmailEmails();


    if (!result.success) {

        console.error(
            "MailNova: Refresh failed"
        );

        return;

    }


    /* =========================================
       REBUILD EMAIL DATA
    ========================================= */

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


    /* =========================================
       SORT
    ========================================= */

    sortEmailsByPriority(
        mailnovaEmails
    );


    /* =========================================
       PRESERVE SEARCH
    ========================================= */

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

    }

    else {

        renderEmails(
            mailnovaEmails
        );

    }


    /* =========================================
       REBUILD CATEGORY BAR
    ========================================= */

    updateCategoryBarWithSort(
        mailnovaEmails
    );


    /* =========================================
       RECONNECT CATEGORY
       AND SORT CONTROLS
    ========================================= */

    setupCategoryFilter();

    setupSortMenu();


    console.log(
        "MailNova: Workspace refreshed:",
        mailnovaEmails.length,
        "emails"
    );

}


/* =========================================
   MAILNOVA SORT FUNCTION
========================================= */

function applyMailnovaSort(sortType) {

    if (!mailnovaEmails.length) {

        return;

    }


    let sortedEmails =
        [...mailnovaEmails];


    /* =========================================
       PRIORITY
    ========================================= */

    if (sortType === "priority") {

        sortEmailsByPriority(
            sortedEmails
        );

    }


    /* =========================================
       NEWEST
    ========================================= */

    else if (sortType === "newest") {

        sortedEmails.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date
                    ).getTime();


                const dateB =
                    new Date(
                        b.date
                    ).getTime();


                return dateB - dateA;

            }
        );

    }


    /* =========================================
       OLDEST
    ========================================= */

    else if (sortType === "oldest") {

        sortedEmails.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date
                    ).getTime();


                const dateB =
                    new Date(
                        b.date
                    ).getTime();


                return dateA - dateB;

            }
        );

    }


    /* =========================================
       SENDER A-Z
    ========================================= */

    else if (sortType === "az") {

        sortedEmails.sort(
            (a, b) => {

                return (

                    (a.sender || "")
                        .toLowerCase()
                        .localeCompare(

                            (b.sender || "")
                                .toLowerCase()

                        )

                );

            }
        );

    }


    /* =========================================
       SENDER Z-A
    ========================================= */

    else if (sortType === "za") {

        sortedEmails.sort(
            (a, b) => {

                return (

                    (b.sender || "")
                        .toLowerCase()
                        .localeCompare(

                            (a.sender || "")
                                .toLowerCase()

                        )

                );

            }
        );

    }


    renderEmails(
        sortedEmails
    );

}
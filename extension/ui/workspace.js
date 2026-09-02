/* =========================================
   MAILNOVA WORKSPACE STATE
========================================= */

let workspace = null;

let mailnovaEmails = [];

let mailnovaFilterState = {
    search: "",
    month: "all",
    category: "All",
    sort: "priority"
};

let mailnovaSyncPromise = null;

const MAILNOVA_SYNC_INTERVAL = 30000;


/* =========================================
   CREATE WORKSPACE
========================================= */

async function createWorkspace() {

    /* =====================================
       PREVENT DUPLICATE WORKSPACE
    ===================================== */

    const existingWorkspace =
        document.getElementById(
            "mailnova-workspace"
        );

    if (existingWorkspace) {

        workspace =
            existingWorkspace;

        return;

    }


    /* =====================================
       REMOVE OLD SORT MENU IF ANY
    ===================================== */

    const oldSortMenu =
        document.getElementById(
            "mailnova-sort-menu"
        );

    if (oldSortMenu) {
        oldSortMenu.remove();
    }


    /* =====================================
       CREATE WORKSPACE
    ===================================== */

    workspace =
        document.createElement(
            "div"
        );

    workspace.id =
        "mailnova-workspace";


    workspace.innerHTML = `

        ${renderHeader()}

        ${renderSearch()}

        ${renderCategoryBar()}

        ${renderEmailList()}

        <div id="mailnova-resizer"></div>

    `;


    document.body.appendChild(
        workspace
    );


    enableWorkspaceResize(
        workspace
    );


    /* =====================================
       HEADER CONTROLS
    ===================================== */

    const refreshButton =
        document.getElementById(
            "mn-refresh"
        );

    const closeButton =
        document.getElementById(
            "mn-close"
        );

    const widthPlusButton =
        document.getElementById(
            "mn-width-plus"
        );

    const widthMinusButton =
        document.getElementById(
            "mn-width-minus"
        );


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


    /* =====================================
       SETUP NORMAL CONTROLS
    ===================================== */

    setupCategoryFilter();

    setupEmailSearch();

    setupMonthFilter();

    setupEmailActions();


    /* =====================================
       SORT SYSTEM
       
       IMPORTANT:
       Sort button is created by
       updateCategoryBarWithSort().
       
       Therefore sort listener is attached
       after the first category render.
    ===================================== */


    /* =====================================
       LOAD CACHE
    ===================================== */

    const cache =
        await loadMailnovaEmailCache();


    if (
        cache &&
        Array.isArray(cache.emails) &&
        cache.emails.length > 0
    ) {

        console.log(
            "MailNova: Persistent cache loaded:",
            cache.emails.length
        );


        mailnovaEmails =
            cache.emails.map(
                (email, index) => {

                    return {

                        ...email,

                        uiId:
                            index,

                        category:
                            email.category ||
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


        /* =================================
           SHOW CACHE IMMEDIATELY
        ================================= */

        applyAllMailnovaFilters();


        /* =================================
           RESTORE SEARCH
        ================================= */

        const searchInput =
            document.getElementById(
                "mailnova-search-input"
            );


        if (searchInput) {

            searchInput.value =
                mailnovaFilterState.search ||
                "";

        }


        /* =================================
           BACKGROUND SYNC
        ================================= */

        if (
            Date.now() -
            cache.timestamp >
            MAILNOVA_SYNC_INTERVAL
        ) {

            syncMailnovaInBackground();

        }


        return;

    }


    /* =====================================
       FIRST LOAD
    ===================================== */

    console.log(
        "MailNova: First load - fetching Gmail..."
    );


    const result =
        await fetchGmailEmails(
            null,
            100
        );


    if (
        !result ||
        !result.success
    ) {

        console.error(
            "MailNova: Gmail emails could not be loaded."
        );

        return;

    }


    /* =====================================
       BUILD FIRST PAGE
    ===================================== */

    mailnovaEmails =
        buildMailnovaEmailData(
            result.emails || []
        );


    /* =====================================
       RENDER FIRST 100
    ===================================== */

    applyAllMailnovaFilters();


    /* =====================================
       SETUP SORT AFTER BUTTON EXISTS
    ===================================== */

    setupSortMenu();


    /* =====================================
       SAVE CACHE
    ===================================== */

    await saveMailnovaEmailCache(
        mailnovaEmails
    );


    /* =====================================
       LOAD REMAINING PAGES
       IN BACKGROUND
    ===================================== */

    syncRemainingMailPages(
        result
    );

}


/* =========================================
   BUILD EMAIL DATA
========================================= */

function buildMailnovaEmailData(
    emails
) {

    return (
        emails || []
    ).map(
        (
            email,
            index
        ) => {

            return {

                ...email,

                uiId:
                    index,

                category:
                    email.category ||
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

}


/* =========================================
   BACKGROUND SYNC
========================================= */

async function syncMailnovaInBackground() {

    if (
        mailnovaSyncPromise
    ) {

        return mailnovaSyncPromise;

    }


    mailnovaSyncPromise =
        (async () => {

            try {

                console.log(
                    "MailNova: Background sync started..."
                );


                const firstPage =
                    await fetchGmailEmails(
                        null,
                        100
                    );


                if (
                    !firstPage ||
                    !firstPage.success
                ) {

                    return;

                }


                const latestEmails =
                    buildMailnovaEmailData(
                        firstPage.emails || []
                    );


                const latestIds =
                    new Set(
                        latestEmails.map(
                            email =>
                                String(
                                    email.id
                                )
                        )
                    );


                const olderCachedEmails =
                    mailnovaEmails.filter(
                        email =>
                            !latestIds.has(
                                String(
                                    email.id
                                )
                            )
                    );


                mailnovaEmails = [
                    ...latestEmails,
                    ...olderCachedEmails
                ];


                mailnovaEmails =
                    deduplicateMailnovaEmails(
                        mailnovaEmails
                    );


                applyAllMailnovaFilters();


                await saveMailnovaEmailCache(
                    mailnovaEmails
                );


                await syncRemainingMailPages(
                    firstPage
                );

            }

            catch (error) {

                console.error(
                    "MailNova: Background sync error:",
                    error
                );

            }

            finally {

                mailnovaSyncPromise =
                    null;

            }

        })();


    return mailnovaSyncPromise;

}


/* =========================================
   LOAD REMAINING PAGES
========================================= */

async function syncRemainingMailPages(
    firstPage
) {

    try {

        let nextPageToken =
            firstPage.next_page_token;

        let pageNumber = 1;


        while (
            nextPageToken
        ) {

            pageNumber++;


            console.log(
                `MailNova: Background loading page ${pageNumber}...`
            );


            const page =
                await fetchGmailEmails(
                    nextPageToken,
                    100
                );


            if (
                !page ||
                !page.success
            ) {

                break;

            }


            const newEmails =
                buildMailnovaEmailData(
                    page.emails || []
                );


            if (
                newEmails.length === 0
            ) {

                break;

            }


            mailnovaEmails =
                deduplicateMailnovaEmails([
                    ...mailnovaEmails,
                    ...newEmails
                ]);


            applyAllMailnovaFilters();


            /*
               Make sure sort system remains
               connected after every refresh.
            */

            setupSortMenu();


            await saveMailnovaEmailCache(
                mailnovaEmails
            );


            console.log(
                "MailNova: Total cached emails:",
                mailnovaEmails.length
            );


            nextPageToken =
                page.next_page_token;


            if (
                pageNumber > 200
            ) {

                console.warn(
                    "MailNova: Pagination safety limit reached."
                );

                break;

            }

        }


        console.log(
            "MailNova: Gmail background sync completed:",
            mailnovaEmails.length
        );

    }

    catch (error) {

        console.error(
            "MailNova: Remaining Gmail pages error:",
            error
        );

    }

}


/* =========================================
   DEDUPLICATE
========================================= */

function deduplicateMailnovaEmails(
    emails
) {

    const map =
        new Map();


    for (
        const email of emails
    ) {

        if (
            !email ||
            !email.id
        ) {

            continue;

        }


        map.set(
            String(
                email.id
            ),
            email
        );

    }


    return Array.from(
        map.values()
    );

}


/* =========================================
   REFRESH WORKSPACE
========================================= */

async function refreshWorkspace() {

    const button =
        document.getElementById(
            "mn-refresh"
        );


    if (button) {

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

    }


    await syncMailnovaInBackground();

}


/* =========================================
   APPLY ALL FILTERS
========================================= */

function applyAllMailnovaFilters() {

    let filtered =
        [...mailnovaEmails];


    /* =====================================
       SEARCH
    ===================================== */

    const searchQuery =
        (
            mailnovaFilterState.search ||
            ""
        )
        .trim()
        .toLowerCase();


    if (searchQuery) {

        filtered =
            filtered.filter(
                (email) => {

                    const sender =
                        (
                            email.sender ||
                            ""
                        ).toLowerCase();

                    const subject =
                        (
                            email.subject ||
                            ""
                        ).toLowerCase();

                    const snippet =
                        (
                            email.snippet ||
                            ""
                        ).toLowerCase();


                    return (
                        sender.includes(
                            searchQuery
                        ) ||

                        subject.includes(
                            searchQuery
                        ) ||

                        snippet.includes(
                            searchQuery
                        )
                    );

                }
            );

    }


    /* =====================================
       MONTH
    ===================================== */

    if (
        mailnovaFilterState.month &&
        mailnovaFilterState.month !== "all"
    ) {

        filtered =
            filtered.filter(
                (email) => {

                    if (!email.date) {
                        return false;
                    }


                    const date =
                        new Date(
                            email.date
                        );


                    if (
                        isNaN(
                            date.getTime()
                        )
                    ) {

                        return false;

                    }


                    const emailMonth =
                        `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, "0")}`;


                    return (
                        emailMonth ===
                        mailnovaFilterState.month
                    );

                }
            );

    }


    /* =====================================
       CATEGORY COUNTS
    ===================================== */

    const categoryBase =
        [...filtered];


    updateCategoryBarWithSort(
        categoryBase
    );


    /* =====================================
       CATEGORY FILTER
    ===================================== */

    if (
        mailnovaFilterState.category &&
        mailnovaFilterState.category !== "All"
    ) {

        filtered =
            filtered.filter(
                email =>
                    email.category ===
                    mailnovaFilterState.category
            );

    }


    /* =====================================
       SORT
    ===================================== */

    applySortToEmailList(
        filtered,
        mailnovaFilterState.sort
    );


    /* =====================================
       RENDER
    ===================================== */

    renderEmails(
        filtered
    );


    console.log(
        "MailNova Filter State:",
        mailnovaFilterState
    );


    console.log(
        "MailNova Filter Results:",
        filtered.length
    );

}


/* =========================================
   SORT EMAILS
========================================= */

function applySortToEmailList(
    emails,
    sortType
) {

    if (
        !Array.isArray(emails)
    ) {

        return;

    }


    if (
        sortType === "priority"
    ) {

        sortEmailsByPriority(
            emails
        );

    }


    else if (
        sortType === "newest"
    ) {

        emails.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date
                    ).getTime();

                const dateB =
                    new Date(
                        b.date
                    ).getTime();


                return (
                    dateB -
                    dateA
                );

            }
        );

    }


    else if (
        sortType === "oldest"
    ) {

        emails.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date
                    ).getTime();

                const dateB =
                    new Date(
                        b.date
                    ).getTime();


                return (
                    dateA -
                    dateB
                );

            }
        );

    }


    else if (
        sortType === "az"
    ) {

        emails.sort(
            (a, b) => {

                return (
                    a.sender || ""
                )
                .toLowerCase()
                .localeCompare(
                    (
                        b.sender ||
                        ""
                    ).toLowerCase()
                );

            }
        );

    }


    else if (
        sortType === "za"
    ) {

        emails.sort(
            (a, b) => {

                return (
                    b.sender || ""
                )
                .toLowerCase()
                .localeCompare(
                    (
                        a.sender ||
                        ""
                    ).toLowerCase()
                );

            }
        );

    }

}


/* =========================================
   CATEGORY BAR + SORT
========================================= */

function updateCategoryBarWithSort(
    emails
) {

    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    if (!bar) {

        return;

    }


    const counts =
        getCategoryCounts(
            emails
        );


    /* =====================================
       CREATE CATEGORY CHIPS ONLY ONCE
    ===================================== */

    let sortWrapper =
        document.getElementById(
            "mailnova-sort-wrapper"
        );


    if (!sortWrapper) {

        bar.innerHTML = `

            <div
                class="mailnova-chip"
                data-category="All">

                📥 All

                <span
                    class="mailnova-category-count">
                    (${counts.All})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Work">

                💼 Work

                <span
                    class="mailnova-category-count">
                    (${counts.Work})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Education">

                🎓 Education

                <span
                    class="mailnova-category-count">
                    (${counts.Education})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Shopping">

                🛒 Shopping

                <span
                    class="mailnova-category-count">
                    (${counts.Shopping})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Banking">

                💳 Banking

                <span
                    class="mailnova-category-count">
                    (${counts.Banking})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Personal">

                👤 Personal

                <span
                    class="mailnova-category-count">
                    (${counts.Personal})
                </span>

            </div>


            <div
                id="mailnova-sort-wrapper"
                class="mailnova-sort-wrapper">

                <button
                    id="mailnova-sort-btn"
                    class="mailnova-sort-btn"
                    type="button">

                    ↕ Sort

                </button>

            </div>

        `;


        /* =================================
           CREATE MENU OUTSIDE CATEGORY BAR
           
           This avoids overflow clipping.
        ================================= */

        sortWrapper =
            document.getElementById(
                "mailnova-sort-wrapper"
            );


        const sortMenu =
            document.createElement(
                "div"
            );


        sortMenu.id =
            "mailnova-sort-menu";


        sortMenu.className =
            "mailnova-sort-menu";


        sortMenu.innerHTML = `

            <div
                class="mailnova-sort-option"
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

        `;


        document.body.appendChild(
            sortMenu
        );


        /* =================================
           NOW INITIALIZE SORT
        ================================= */

        setupSortMenu();

    }


    /* =====================================
       UPDATE COUNTS
    ===================================== */

    const chips =
        bar.querySelectorAll(
            ".mailnova-chip"
        );


    chips.forEach(
        (chip) => {

            const category =
                chip.dataset.category;


            const count =
                counts[category] || 0;


            const countElement =
                chip.querySelector(
                    ".mailnova-category-count"
                );


            if (countElement) {

                countElement.textContent =
                    `(${count})`;

            }

        }
    );


    /* =====================================
       ACTIVE CATEGORY
    ===================================== */

    chips.forEach(
        (chip) => {

            chip.classList.toggle(
                "active",

                chip.dataset.category ===
                mailnovaFilterState.category
            );

        }
    );


    /* =====================================
       ACTIVE SORT
    ===================================== */

    const sortOptions =
        document.querySelectorAll(
            "#mailnova-sort-menu .mailnova-sort-option"
        );


    sortOptions.forEach(
        (option) => {

            option.classList.toggle(
                "active",

                option.dataset.sort ===
                mailnovaFilterState.sort
            );

        }
    );

}


/* =========================================
   CATEGORY FILTER
========================================= */

function setupCategoryFilter() {

    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );


    if (!bar) {

        return;

    }


    if (
        bar.dataset.categoryListener ===
        "true"
    ) {

        return;

    }


    bar.dataset.categoryListener =
        "true";


    bar.addEventListener(
        "click",
        (e) => {

            const chip =
                e.target.closest(
                    ".mailnova-chip"
                );


            if (!chip) {

                return;

            }


            const category =
                chip.dataset.category;


            if (!category) {

                return;

            }


            mailnovaFilterState.category =
                category;


            applyAllMailnovaFilters();

        }
    );

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

        return;

    }


    /* =====================================
       PREVENT DUPLICATE SETUP
    ===================================== */

    if (
        sortButton.dataset.sortListener ===
        "true"
    ) {

        updateSortMenuPosition(
            sortButton,
            sortMenu
        );

        return;

    }


    sortButton.dataset.sortListener =
        "true";


    console.log(
        "MailNova: Sort button initialized."
    );


    /* =====================================
       SORT BUTTON CLICK
    ===================================== */

    sortButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                sortMenu.classList.contains(
                    "open"
                );


            if (isOpen) {

                closeSortMenu();

                return;

            }


            openSortMenu();

        }
    );


    /* =====================================
       SORT OPTIONS
    ===================================== */

    sortMenu
        .querySelectorAll(
            ".mailnova-sort-option"
        )
        .forEach(
            (option) => {

                option.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                        event.stopPropagation();


                        const sortType =
                            option.dataset.sort;


                        if (!sortType) {

                            return;

                        }


                        mailnovaFilterState.sort =
                            sortType;


                        /* =====================
                           APPLY SORT
                        ===================== */

                        applyAllMailnovaFilters();


                        /* =====================
                           KEEP MENU OPEN
                           ===================== */

                        requestAnimationFrame(
                            () => {

                                openSortMenu();

                            }
                        );


                        console.log(
                            "MailNova: Sort selected:",
                            sortType
                        );

                    }
                );

            }
        );

}


/* =========================================
   OPEN SORT MENU
========================================= */

function openSortMenu() {

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

        console.error(
            "MailNova: Sort button/menu missing."
        );

        return;

    }


    updateSortMenuPosition(
        sortButton,
        sortMenu
    );


    sortMenu.classList.add(
        "open"
    );


    sortMenu.style.display =
        "block";


    sortMenu.style.visibility =
        "visible";


    sortMenu.style.opacity =
        "1";


    sortMenu.style.zIndex =
        "2147483647";


    console.log(
        "MailNova: Sort menu opened."
    );

}


/* =========================================
   CLOSE SORT MENU
========================================= */

function closeSortMenu() {

    const sortMenu =
        document.getElementById(
            "mailnova-sort-menu"
        );


    if (!sortMenu) {

        return;

    }


    sortMenu.classList.remove(
        "open"
    );


    sortMenu.style.display =
        "none";

}


/* =========================================
   POSITION SORT MENU
========================================= */

function updateSortMenuPosition(
    sortButton,
    sortMenu
) {

    if (
        !sortButton ||
        !sortMenu
    ) {

        return;

    }


    const rect =
        sortButton.getBoundingClientRect();


    const menuWidth =
        210;


    /*
       Temporarily show menu so its
       height can be measured.
    */

    sortMenu.style.display =
        "block";


    sortMenu.style.visibility =
        "hidden";


    sortMenu.style.opacity =
        "0";


    const menuHeight =
        sortMenu.offsetHeight ||
        240;


    let left =
        rect.right -
        menuWidth;


    let top =
        rect.bottom +
        8;


    /* =====================================
       RIGHT BOUNDARY
    ===================================== */

    if (
        left +
        menuWidth >
        window.innerWidth -
        10
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;

    }


    /* =====================================
       LEFT BOUNDARY
    ===================================== */

    if (
        left < 10
    ) {

        left = 10;

    }


    /* =====================================
       BOTTOM BOUNDARY
    ===================================== */

    if (
        top +
        menuHeight >
        window.innerHeight -
        10
    ) {

        top =
            rect.top -
            menuHeight -
            8;

    }


    sortMenu.style.position =
        "fixed";


    sortMenu.style.left =
        `${left}px`;


    sortMenu.style.top =
        `${top}px`;


    sortMenu.style.width =
        `${menuWidth}px`;


    sortMenu.style.zIndex =
        "2147483647";

}


/* =========================================
   OUTSIDE CLICK
========================================= */

if (
    !window.__mailnovaSortOutsideClick
) {

    window.__mailnovaSortOutsideClick =
        true;


    document.addEventListener(
        "click",
        (event) => {

            const sortMenu =
                document.getElementById(
                    "mailnova-sort-menu"
                );


            const sortButton =
                document.getElementById(
                    "mailnova-sort-btn"
                );


            if (
                !sortMenu ||
                !sortButton
            ) {

                return;

            }


            if (
                !sortMenu.contains(
                    event.target
                ) &&
                !sortButton.contains(
                    event.target
                )
            ) {

                closeSortMenu();

            }

        }
    );

}


/* =========================================
   KEEP MENU POSITIONED
========================================= */

if (
    !window.__mailnovaSortResizeListener
) {

    window.__mailnovaSortResizeListener =
        true;


    window.addEventListener(
        "resize",
        () => {

            const sortButton =
                document.getElementById(
                    "mailnova-sort-btn"
                );


            const sortMenu =
                document.getElementById(
                    "mailnova-sort-menu"
                );


            if (
                sortButton &&
                sortMenu &&
                sortMenu.classList.contains(
                    "open"
                )
            ) {

                updateSortMenuPosition(
                    sortButton,
                    sortMenu
                );

            }

        }
    );

}


/* =========================================
   EMAIL ACTIONS
========================================= */

function setupEmailActions() {

    if (!workspace) {

        return;

    }


    if (
        workspace.dataset.emailActionsListener ===
        "true"
    ) {

        return;

    }


    workspace.dataset.emailActionsListener =
        "true";


    workspace.addEventListener(
        "click",
        (e) => {

            /* =========================
               VIEW
            ========================= */

            const viewButton =
                e.target.closest(
                    ".mn-view"
                );


            if (viewButton) {

                e.preventDefault();

                e.stopPropagation();


                const emailId =
                    viewButton.dataset.id;


                const email =
                    mailnovaEmails.find(
                        mail =>
                            String(
                                mail.id
                            ) ===
                            String(
                                emailId
                            )
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
               REPLY
            ========================= */

            const replyButton =
                e.target.closest(
                    ".mn-reply"
                );


            if (replyButton) {

                e.preventDefault();

                e.stopPropagation();


                const emailId =
                    replyButton.dataset.id;


                const email =
                    mailnovaEmails.find(
                        mail =>
                            String(
                                mail.id
                            ) ===
                            String(
                                emailId
                            )
                    );


                if (!email) {

                    return;

                }


                openReplyComposer(
                    email
                );


                return;

            }


            /* =========================
               ASK AI
            ========================= */

            const askAIButton =
                e.target.closest(
                    ".mn-ai"
                );


            if (askAIButton) {

                e.preventDefault();

                e.stopPropagation();


                const emailId =
                    askAIButton.dataset.id;


                const email =
                    mailnovaEmails.find(
                        mail =>
                            String(
                                mail.id
                            ) ===
                            String(
                                emailId
                            )
                    );


                if (!email) {

                    return;

                }


                openAskAI(
                    email
                );

            }

        }
    );

}


/* =========================================
   CLOSE WORKSPACE
========================================= */

function closeWorkspace() {

    const sortMenu =
        document.getElementById(
            "mailnova-sort-menu"
        );


    if (sortMenu) {

        sortMenu.remove();

    }


    if (workspace) {

        workspace.remove();

        workspace = null;

    }

}


/* =========================================
   MINIMIZE
========================================= */

function minimizeWorkspace() {

    if (!workspace) {

        return;

    }


    workspace.style.display =
        "none";

}


/* =========================================
   RESTORE
========================================= */

function restoreWorkspace() {

    if (!workspace) {

        return;

    }


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

    if (!workspace) {

        return;

    }


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

    if (!workspace) {

        return;

    }


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

function renderEmails(
    emailList
) {

    const container =
        document.querySelector(
            ".mailnova-email-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        emailList
            .map(
                createEmailCard
            )
            .join("");

}


/* =========================================
   REFRESH
========================================= */

async function forceRefreshMailnova() {

    await syncMailnovaInBackground();

}
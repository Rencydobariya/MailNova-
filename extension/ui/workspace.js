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

let mailnovaRemainingSyncPromise = null;

let mailnovaIsRefreshing = false;

let mailnovaCategoryRefreshTimer = null;

const MAILNOVA_SYNC_INTERVAL = 30000;


/* =========================================
   PRIORITY RANKING REFRESH
========================================= */

function refreshMailnovaPriorityRanking() {

    if (!workspace) return;

    applyAllMailnovaFilters();

}


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
       REMOVE OLD SORT MENU
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


    /* =====================================
       LOAD SETTINGS
    ===================================== */

    if (
        typeof loadMailnovaSettings ===
        "function"
    ) {

        try {

            await loadMailnovaSettings();

        }

        catch (error) {

            console.warn(
                "MailNova: Settings could not be loaded:",
                error
            );

        }

    }


    /* =====================================
       APPLY THEME
    ===================================== */

    if (
        typeof applyMailnovaTheme ===
        "function"
    ) {

        applyMailnovaTheme(
            mailnovaSettings?.theme ||
            "light"
        );

    }


    /* =====================================
       APPLY APPEARANCE SETTINGS
    ===================================== */

    if (
        typeof applyMailnovaAppearanceSettings ===
        "function"
    ) {

        applyMailnovaAppearanceSettings();

    }


    /* =====================================
       PRIORITY FOCUS
    ===================================== */

    if (
        typeof setMailnovaPriorityFocus ===
        "function"
    ) {

        setMailnovaPriorityFocus(
            mailnovaSettings?.priorityFocus ||
            "unread"
        );

    }


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


    const settingsButton =
        document.getElementById(
            "mn-settings"
        );


    /* =====================================
       REFRESH
    ===================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshWorkspace
        );

    }


    /* =====================================
       CLOSE
    ===================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeWorkspace
        );

    }


    /* =====================================
       SETTINGS
    ===================================== */

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                if (
                    typeof openMailnovaSettings ===
                    "function"
                ) {

                    openMailnovaSettings(
                        event
                    );

                }

            }
        );

    }


    /* =====================================
       WIDTH PLUS
    ===================================== */

    if (widthPlusButton) {

        widthPlusButton.addEventListener(
            "click",
            increaseWidth
        );

    }


    /* =====================================
       WIDTH MINUS
    ===================================== */

    if (widthMinusButton) {

        widthMinusButton.addEventListener(
            "click",
            decreaseWidth
        );

    }


    /* =====================================
       NORMAL CONTROLS
    ===================================== */

    setupCategoryFilter();

    setupEmailSearch();

    setupMonthFilter();

    setupEmailActions();


    /* =====================================
       ENABLE RESIZE
    ===================================== */

    if (
        typeof enableWorkspaceResize ===
        "function"
    ) {

        enableWorkspaceResize(
            workspace
        );

    }


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
            buildMailnovaEmailData(
                cache.emails
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

        const backgroundSyncEnabled =
            typeof mailnovaSettings ===
            "undefined" ||
            mailnovaSettings.backgroundSync !== false;


        const cacheAge =
            Date.now() -
            Number(
                cache.timestamp || 0
            );


        if (
            backgroundSyncEnabled &&
            cacheAge >
            MAILNOVA_SYNC_INTERVAL
        ) {

            /*
               Do not block workspace rendering.
            */

            setTimeout(
                () => {

                    syncMailnovaInBackground();

                },
                50
            );

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
       RENDER FIRST 100 IMMEDIATELY
    ===================================== */

    applyAllMailnovaFilters();


    /* =====================================
       SETUP SORT
    ===================================== */

    setupSortMenu();


    /* =====================================
       SAVE FIRST PAGE
    ===================================== */

    await saveMailnovaEmailCache(
        mailnovaEmails
    );


    /* =====================================
       LOADING MODE
    ===================================== */

    const loadingMode =
        getMailnovaLoadingMode();


    /* =====================================
       FAST
    ===================================== */

    if (
        loadingMode === "fast"
    ) {

        startRemainingMailSync(
            result,
            0,
            false
        );

    }


    /* =====================================
       BALANCED
    ===================================== */

    else if (
        loadingMode === "balanced"
    ) {

        startRemainingMailSync(
            result,
            500,
            false
        );

    }


    /* =====================================
       COMPLETE
    ===================================== */

    else {

        await startRemainingMailSync(
            result,
            0,
            true
        );

    }

}


/* =========================================
   GET LOADING MODE
========================================= */

function getMailnovaLoadingMode() {

    if (
        typeof mailnovaSettings ===
        "undefined"
    ) {

        return "fast";

    }


    const mode =
        mailnovaSettings.emailLoading;


    if (
        mode === "balanced"
    ) {

        return "balanced";

    }


    if (
        mode === "complete"
    ) {

        return "complete";

    }


    return "fast";

}


/* =========================================
   IS CATEGORY DETECTION ENABLED
========================================= */

function isMailnovaCategoryDetectionEnabled() {

    return (
        typeof mailnovaSettings ===
        "undefined" ||
        mailnovaSettings.categoryDetection !== false
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

            let category =
                email.category ||
                "Personal";


            /*
               Only run category detection when
               the setting is enabled.
            */

            if (
                isMailnovaCategoryDetectionEnabled() &&
                typeof detectCategory ===
                "function"
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

                ...email,

                uiId:
                    email.uiId ??
                    `${email.id || "email"}-${index}`,

                category

            };

        }
    );

}


/* =========================================
   RECALCULATE CATEGORIES
========================================= */

function refreshMailnovaCategories() {

    if (
        !Array.isArray(mailnovaEmails) ||
        mailnovaEmails.length === 0
    ) {

        return;

    }


    if (
        !isMailnovaCategoryDetectionEnabled()
    ) {

        return;

    }


    if (
        typeof detectCategory !==
        "function"
    ) {

        return;

    }


    mailnovaEmails =
        mailnovaEmails.map(
            (email) => {

                return {

                    ...email,

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

}


/* =========================================
   BACKGROUND SYNC
========================================= */

async function syncMailnovaInBackground() {

    /*
       Prevent duplicate sync operations.
    */

    if (
        mailnovaSyncPromise
    ) {

        return mailnovaSyncPromise;

    }


    /*
       Automatic sync respects Background Sync.
       Manual refresh explicitly bypasses it.
    */

    const isAutomaticSync =
        !window.__mailnovaManualRefresh;


    if (
        isAutomaticSync &&
        typeof mailnovaSettings !==
        "undefined" &&
        mailnovaSettings.backgroundSync ===
        false
    ) {

        console.log(
            "MailNova: Background Sync is disabled."
        );

        return;

    }


    mailnovaSyncPromise =
        (async () => {

            try {

                console.log(
                    "MailNova: Gmail sync started..."
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


                mailnovaEmails =
                    deduplicateMailnovaEmails([
                        ...latestEmails,
                        ...olderCachedEmails
                    ]);


                /*
                   Render only the first-page result.
                   This gives immediate visual feedback.
                */

                applyAllMailnovaFilters();


                await saveMailnovaEmailCache(
                    mailnovaEmails
                );


                /*
                   Manual Refresh:
                   fully synchronize according to
                   the user's loading preference.

                   Automatic Sync:
                   respect emailLoading setting
                   and never block the workspace.
                */

                const loadingMode =
                    getMailnovaLoadingMode();


                if (
                    window.__mailnovaManualRefresh
                ) {

                    await startRemainingMailSync(
                        firstPage,
                        0,
                        true
                    );

                }

                else if (
                    loadingMode ===
                    "complete"
                ) {

                    /*
                       Complete mode means all pages.
                    */

                    await startRemainingMailSync(
                        firstPage,
                        0,
                        true
                    );

                }

                else if (
                    loadingMode ===
                    "balanced"
                ) {

                    startRemainingMailSync(
                        firstPage,
                        500,
                        false
                    );

                }

                else {

                    startRemainingMailSync(
                        firstPage,
                        0,
                        false
                    );

                }

            }

            catch (error) {

                console.error(
                    "MailNova: Gmail sync error:",
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
   START REMAINING MAIL SYNC
========================================= */

function startRemainingMailSync(
    firstPage,
    delay = 0,
    waitForCompletion = false
) {

    /*
       Reuse an already-running pagination job.
    */

    if (
        mailnovaRemainingSyncPromise
    ) {

        return waitForCompletion
            ? mailnovaRemainingSyncPromise
            : undefined;

    }


    const runSync =
        async () => {

            if (
                delay > 0
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            delay
                        )
                );

            }


            if (!workspace) {

                return;

            }


            await syncRemainingMailPages(
                firstPage
            );

        };


    mailnovaRemainingSyncPromise =
        runSync().finally(
            () => {

                mailnovaRemainingSyncPromise =
                    null;

            }
        );


    return waitForCompletion
        ? mailnovaRemainingSyncPromise
        : undefined;

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


        let pageNumber =
            1;


        let pagesSinceRender =
            0;


        let changedSinceSave =
            false;


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


            changedSinceSave =
                true;


            pagesSinceRender++;


            /*
               Render only every 3 pages.

               This prevents hundreds/thousands
               of unnecessary DOM rebuilds.
            */

            if (
                pagesSinceRender >= 3
            ) {

                applyAllMailnovaFilters();

                pagesSinceRender =
                    0;

            }


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


        /*
           Render any final pending emails.
        */

        if (
            pagesSinceRender > 0
        ) {

            applyAllMailnovaFilters();

        }


        if (
            changedSinceSave
        ) {

            await saveMailnovaEmailCache(
                mailnovaEmails
            );

        }


        console.log(
            "MailNova: Gmail pagination completed:",
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
        const email of
        emails || []
    ) {

        if (
            !email ||
            !email.id
        ) {

            continue;

        }


        const id =
            String(
                email.id
            );


        /*
           Latest email object wins.
        */

        map.set(
            id,
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

    if (
        mailnovaIsRefreshing
    ) {

        return;

    }


    mailnovaIsRefreshing =
        true;


    const button =
        document.getElementById(
            "mn-refresh"
        );


    const emailList =
        workspace
            ? workspace.querySelector(
                ".mailnova-email-list"
            )
            : document.querySelector(
                ".mailnova-email-list"
            );


    /* =====================================
       START SMOOTH SCROLL IMMEDIATELY
    ===================================== */

    if (emailList) {

        emailList.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    /* =====================================
       REFRESH BUTTON STATE
    ===================================== */

    if (button) {

        button.classList.add(
            "mailnova-refreshing"
        );

        button.setAttribute(
            "aria-busy",
            "true"
        );

        button.disabled =
            true;

    }


    window.__mailnovaManualRefresh =
        true;


    try {

        /*
           Refresh Gmail immediately.
        */

        await syncMailnovaInBackground();


        /*
           Final smooth scroll after
           refreshed emails are rendered.
        */

        const refreshedList =
            workspace
                ? workspace.querySelector(
                    ".mailnova-email-list"
                )
                : document.querySelector(
                    ".mailnova-email-list"
                );


        if (refreshedList) {

            requestAnimationFrame(
                () => {

                    refreshedList.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });

                }
            );

        }


        console.log(
            "MailNova: Refresh completed."
        );

    }

    catch (error) {

        console.error(
            "MailNova: Refresh failed:",
            error
        );

    }

    finally {

        window.__mailnovaManualRefresh =
            false;


        if (button) {

            button.classList.remove(
                "mailnova-refreshing"
            );

            button.removeAttribute(
                "aria-busy"
            );

            button.disabled =
                false;

        }


        mailnovaIsRefreshing =
            false;

    }

}


/* =========================================
   APPLY ALL FILTERS
========================================= */

function applyAllMailnovaFilters() {

    if (
        !Array.isArray(mailnovaEmails)
    ) {

        return;

    }


    if (!workspace) {

        return;

    }


    /*
       IMPORTANT PERFORMANCE RULE:

       Do NOT recalculate every email category
       every time the user clicks a category,
       sort, search, or month.

       Categories are recalculated only when
       the setting changes or new Gmail data
       arrives.
    */


    let filtered =
        mailnovaEmails;


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


    if (
        searchQuery
    ) {

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
        mailnovaFilterState.month !==
        "all"
    ) {

        filtered =
            filtered.filter(
                (email) => {

                    if (
                        !email.date
                    ) {

                        return false;

                    }


                    const date =
                        new Date(
                            email.date
                        );


                    if (
                        Number.isNaN(
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

    updateCategoryBarWithSort(
        filtered
    );


    /* =====================================
       CATEGORY FILTER
    ===================================== */

    if (
        mailnovaFilterState.category &&
        mailnovaFilterState.category !==
        "All"
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

       IMPORTANT:
       Slice first so the original
       mailnovaEmails array is never mutated.
    ===================================== */

    filtered =
        Array.isArray(filtered)
            ? filtered.slice()
            : [];


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
        sortType ===
        "priority"
    ) {

        if (
            typeof sortEmailsByPriority ===
            "function"
        ) {

            sortEmailsByPriority(
                emails
            );

        }

    }


    else if (
        sortType ===
        "newest"
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
        sortType ===
        "oldest"
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
        sortType ===
        "az"
    ) {

        emails.sort(
            (a, b) => {

                return (
                    a.sender ||
                    ""
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
        sortType ===
        "za"
    ) {

        emails.sort(
            (a, b) => {

                return (
                    b.sender ||
                    ""
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
       CREATE CATEGORY UI ONCE
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
                    (${counts.All || 0})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Work">

                💼 Work

                <span
                    class="mailnova-category-count">
                    (${counts.Work || 0})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Education">

                🎓 Education

                <span
                    class="mailnova-category-count">
                    (${counts.Education || 0})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Shopping">

                🛒 Shopping

                <span
                    class="mailnova-category-count">
                    (${counts.Shopping || 0})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Banking">

                💳 Banking

                <span
                    class="mailnova-category-count">
                    (${counts.Banking || 0})
                </span>

            </div>


            <div
                class="mailnova-chip"
                data-category="Personal">

                👤 Personal

                <span
                    class="mailnova-category-count">
                    (${counts.Personal || 0})
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
                counts[category] ||
                0;


            const countElement =
                chip.querySelector(
                    ".mailnova-category-count"
                );


            if (countElement) {

                countElement.textContent =
                    `(${count})`;

            }


            chip.classList.toggle(
                "active",

                category ===
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


            if (
                mailnovaFilterState.category ===
                category
            ) {

                return;

            }


            mailnovaFilterState.category =
                category;


            /*
               Pure local filtering.
               NO Gmail API request.
            */

            applyAllMailnovaFilters();

        }
    );

}


/* =========================================
   CLOSE MONTH FILTER
========================================= */

function closeMailnovaMonthFilter() {

    const monthFilter =
        document.querySelector(
            ".mailnova-month-filter"
        );


    if (!monthFilter) {

        return;

    }


    const dropdown =
        monthFilter.querySelector(
            ".mailnova-month-dropdown"
        );


    if (dropdown) {

        dropdown.classList.remove(
            "open"
        );

    }


    const button =
        monthFilter.querySelector(
            ".mailnova-month-btn"
        );


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

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


    sortButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            closeMailnovaMonthFilter();


            const isOpen =
                sortMenu.classList.contains(
                    "open"
                );


            if (isOpen) {

                closeSortMenu();

            }

            else {

                openSortMenu();

            }

        }
    );


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


                        applyAllMailnovaFilters();


                        requestAnimationFrame(
                            () => {

                                openSortMenu();

                            }
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

        return;

    }


    closeMailnovaMonthFilter();


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


    if (
        left < 10
    ) {

        left =
            10;

    }


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
   MENU SYNC
========================================= */

if (
    !window.__mailnovaMenuSync
) {

    window.__mailnovaMenuSync =
        true;


    document.addEventListener(
        "click",
        (event) => {

            const monthButton =
                event.target.closest(
                    ".mailnova-month-btn, #mailnova-month-button"
                );


            if (monthButton) {

                closeSortMenu();

            }

        },
        true
    );

}


/* =========================================
   OUTSIDE SORT CLICK
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
   SORT RESIZE
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
        async (e) => {

            /* =========================
               MARK READ / UNREAD
            ========================= */

            const markReadButton =
                e.target.closest(
                    ".mn-mark-read"
                );


            if (markReadButton) {

                e.preventDefault();

                e.stopPropagation();


                const emailId =
                    markReadButton.dataset.id;


                if (!emailId) {

                    return;

                }


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


                if (
                    markReadButton.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                const currentlyUnread =
                    Boolean(
                        email.unread
                    );


                markReadButton.dataset.loading =
                    "true";


                markReadButton.disabled =
                    true;


                try {

                    let result;


                    if (
                        currentlyUnread
                    ) {

                        if (
                            typeof markEmailAsRead !==
                            "function"
                        ) {

                            throw new Error(
                                "markEmailAsRead() is not available."
                            );

                        }


                        result =
                            await markEmailAsRead(
                                emailId
                            );

                    }

                    else {

                        if (
                            typeof markEmailAsUnread !==
                            "function"
                        ) {

                            throw new Error(
                                "markEmailAsUnread() is not available."
                            );

                        }


                        result =
                            await markEmailAsUnread(
                                emailId
                            );

                    }


                    if (
                        !result ||
                        !result.success
                    ) {

                        console.error(
                            "MailNova: Read/Unread update failed:",
                            result?.error ||
                            result?.message
                        );

                        return;

                    }


                    email.unread =
                        !currentlyUnread;


                    await saveMailnovaEmailCache(
                        mailnovaEmails
                    );


                    /*
                       Update only this card.
                       Do NOT rerender the entire list.
                    */

                    updateMailnovaReadUnreadCard(
                        emailId,
                        email.unread
                    );

                }

                catch (error) {

                    console.error(
                        "MailNova: Read/Unread error:",
                        error
                    );

                }

                finally {

                    markReadButton.dataset.loading =
                        "false";


                    markReadButton.disabled =
                        false;

                }


                return;

            }


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

                    return;

                }


                const threadId =
                    email.threadId;


                if (!threadId) {

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
                    100
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


                if (
                    typeof openReplyComposer ===
                    "function"
                ) {

                    openReplyComposer(
                        email
                    );

                }


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


                if (
                    typeof openAskAI ===
                    "function"
                ) {

                    openAskAI(
                        email
                    );

                }

            }

        }
    );

}


/* =========================================
   UPDATE READ / UNREAD CARD UI
========================================= */

function updateMailnovaReadUnreadCard(
    emailId,
    isUnread
) {

    const cards =
        document.querySelectorAll(
            ".mailnova-email-card"
        );


    let card = null;


    cards.forEach(
        (candidate) => {

            if (
                String(
                    candidate.dataset.id
                ) ===
                String(
                    emailId
                )
            ) {

                card =
                    candidate;

            }

        }
    );


    if (!card) {

        return;

    }


    /* =====================================
       CARD STATE
    ===================================== */

    card.classList.toggle(
        "mailnova-email-unread",
        Boolean(isUnread)
    );


    card.classList.toggle(
        "mailnova-email-read",
        !Boolean(isUnread)
    );


    /* =====================================
       STATUS BADGE
    ===================================== */

    const statusBadge =
        card.querySelector(
            ".mailnova-read-status"
        );


    if (statusBadge) {

        statusBadge.textContent =
            isUnread
                ? "UNREAD"
                : "READ";


        statusBadge.dataset.unread =
            isUnread
                ? "true"
                : "false";


        statusBadge.setAttribute(
            "aria-label",
            isUnread
                ? "Mark as read"
                : "Mark as unread"
        );

    }


    /* =====================================
       STATUS DOT
    ===================================== */

    const statusDot =
        card.querySelector(
            ".mailnova-read-status-dot"
        );


    if (statusDot) {

        statusDot.classList.toggle(
            "unread",
            Boolean(isUnread)
        );

    }


    /* =====================================
       READ / UNREAD BUTTON
    ===================================== */

    const actionButton =
        card.querySelector(
            ".mn-mark-read"
        );


    if (!actionButton) {

        return;

    }


    actionButton.dataset.unread =
        isUnread
            ? "true"
            : "false";


    actionButton.setAttribute(
        "aria-label",
        isUnread
            ? "Mark as read"
            : "Mark as unread"
    );


    /*
       UNREAD → open envelope
       READ   → closed envelope
    */

    actionButton.innerHTML =
        isUnread
            ? `
                <svg
                    class="mn-mark-read-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <path
                        d="M3.5 7
                           A2 2 0 0 1 5.5 5
                           H18.5
                           A2 2 0 0 1 20.5 7
                           V17
                           A2 2 0 0 1 18.5 19
                           H5.5
                           A2 2 0 0 1 3.5 17
                           Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M4.5 7
                           L12 12.7
                           L19.5 7"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                </svg>
            `
            : `
                <svg
                    class="mn-mark-read-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <rect
                        x="3.5"
                        y="5"
                        width="17"
                        height="14"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                    />

                    <path
                        d="M4.5 7
                           L12 12.5
                           L19.5 7"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                </svg>
            `;

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


    workspace.style.width =
        Math.min(
            currentWidth + 50,
            1300
        ) + "px";

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


    workspace.style.width =
        Math.max(
            currentWidth - 50,
            300
        ) + "px";

}


/* =========================================
   RENDER EMAILS
========================================= */

function renderEmails(
    emailList
) {

    const container =
        workspace
            ? workspace.querySelector(
                ".mailnova-email-list"
            )
            : document.querySelector(
                ".mailnova-email-list"
            );


    if (!container) {

        return;

    }


    if (!workspace) {

        return;

    }


    const emails =
        Array.isArray(emailList)
            ? emailList
            : [];


    /*
       Build the complete HTML string first.
       Only one DOM write.
    */

    const html =
        emails
            .map(
                createEmailCard
            )
            .join("");


    container.innerHTML =
        html;

}


/* =========================================
   FORCE REFRESH
========================================= */

async function forceRefreshMailnova() {

    window.__mailnovaManualRefresh =
        true;


    try {

        await syncMailnovaInBackground();

    }

    finally {

        window.__mailnovaManualRefresh =
            false;

    }

}


/* =========================================
   SETTINGS CHANGE HELPER
========================================= */

function handleMailnovaWorkspaceSettingChange(
    key,
    value
) {

    /*
       Category Detection
    */

    if (
        key ===
        "categoryDetection"
    ) {

        if (
            value === true
        ) {

            refreshMailnovaCategories();

        }


        applyAllMailnovaFilters();

        return;

    }


    /*
       Loading mode:
       Apply to future syncs.
       If the user chooses Complete,
       start remaining pagination now if
       one is available through a fresh sync.
    */

    if (
        key ===
        "emailLoading"
    ) {

        return;

    }


    /*
       Background Sync:
       If enabled, perform a fresh sync
       when workspace is already open.
    */

    if (
        key ===
        "backgroundSync"
    ) {

        if (
            value === true &&
            workspace
        ) {

            syncMailnovaInBackground();

        }

        return;

    }


    /*
       Priority focus changes only require
       local re-sorting/filtering.
    */

    if (
        key ===
        "priorityFocus"
    ) {

        refreshMailnovaPriorityRanking();

    }

}


/* =========================================
   EXTERNAL SETTINGS INTEGRATION
========================================= */

if (
    !window.__mailnovaWorkspaceSettingBridge
) {

    window.__mailnovaWorkspaceSettingBridge =
        true;


    window.addEventListener(
        "mailnova-setting-changed",
        (event) => {

            const detail =
                event.detail || {};


            handleMailnovaWorkspaceSettingChange(
                detail.key,
                detail.value
            );

        }
    );

}
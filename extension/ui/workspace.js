/* =========================================
   MAILNOVA WORKSPACE STATE
========================================= */

let workspace = null;

let mailnovaEmails = [];


/* =========================================
   READ / UNREAD LOCAL STATE OVERRIDES

   Keeps user's latest MailNova action stable
   while background Gmail sync is running.
========================================= */

const mailnovaReadStateOverrides = new Map();


const MAILNOVA_READ_STATE_KEY =
    "mailnova_read_state_overrides";


async function loadMailnovaReadStateOverrides() {

    try {

        const result =
            await chrome.storage.local.get(
                MAILNOVA_READ_STATE_KEY
            );

        const saved =
            result[MAILNOVA_READ_STATE_KEY] || {};

        mailnovaReadStateOverrides.clear();

        Object.entries(saved).forEach(
            ([id, unread]) => {

                mailnovaReadStateOverrides.set(
                    String(id),
                    Boolean(unread)
                );

            }
        );

        console.log(
            "MailNova: Read/Unread overrides loaded:",
            mailnovaReadStateOverrides.size
        );

    }

    catch (error) {

        console.warn(
            "MailNova: Could not load read state overrides:",
            error
        );

    }

}


async function saveMailnovaReadStateOverride(
    emailId,
    unread
) {

    try {

        const current =
            await chrome.storage.local.get(
                MAILNOVA_READ_STATE_KEY
            );

        const overrides =
            current[MAILNOVA_READ_STATE_KEY] || {};

        overrides[String(emailId)] =
            Boolean(unread);

        await chrome.storage.local.set({

            [MAILNOVA_READ_STATE_KEY]:
                overrides

        });

    }

    catch (error) {

        console.warn(
            "MailNova: Could not save read state override:",
            error
        );

    }

}


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
  await loadMailnovaReadStateOverrides();
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
        async (event) => {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "MailNova: Refresh button clicked."
            );

            if (
                refreshButton.disabled
            ) {
                return;
            }

            refreshButton.classList.add(
                "mailnova-refreshing"
            );

            refreshButton.disabled =
                true;

            try {

                await refreshWorkspace();

            }

            catch (error) {

                console.error(
                    "MailNova: Refresh button error:",
                    error
                );

            }

            finally {

                refreshButton.classList.remove(
                    "mailnova-refreshing"
                );

                refreshButton.disabled =
                    false;

            }

        }
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
           RESTORE CACHED AI INTELLIGENCE
           Non-blocking for initial render.
        ================================= */

        if (
            typeof restoreMailnovaAIResults ===
            "function"
        ) {
            restoreMailnovaAIResults(
                mailnovaEmails
            ).then(() => {
                applyAllMailnovaFilters();
            }).catch(() => {});
        }


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
            25
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
       BACKGROUND AI INTELLIGENCE
       Never blocks the first render.
    ===================================== */

    if (
        typeof startMailnovaAIAnalysis ===
        "function"
    ) {
        setTimeout(() => {
            startMailnovaAIAnalysis(
                mailnovaEmails
            );
        }, 1200);
    }


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

function buildMailnovaEmailData(emails) {

    return (emails || []).map(
        (email, index) => {

            const emailId =
                String(
                    email?.id || ""
                );

            /*
             * ALWAYS respect the latest local
             * MailNova read/unread action.
             *
             * Gmail background sync can temporarily
             * return the old state while Gmail finishes
             * propagating the label change.
             */
            let unread =
                Boolean(
                    email?.unread
                );

            if (
                emailId &&
                mailnovaReadStateOverrides.has(emailId)
            ) {

                unread =
                    Boolean(
                        mailnovaReadStateOverrides.get(
                            emailId
                        )
                    );

            }

            let category =
                email?.category ||
                "Personal";

            if (
                typeof isMailnovaCategoryDetectionEnabled ===
                "function" &&
                isMailnovaCategoryDetectionEnabled()
            ) {

                category =
                    email?.category ||
                    detectCategory({

                        sender:
                            email?.sender ||
                            "",

                        subject:
                            email?.subject ||
                            "",

                        snippet:
                            email?.snippet ||
                            ""

                    });

            }

            return {

                ...email,

                id:
                    email?.id || "",

                unread,

                uiId:
                    index,

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
                        email.aiCategory ||
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

/*
 * Preserve the current MailNova state for
 * emails that are already loaded.
 *
 * This prevents a background Gmail response
 * from temporarily reverting READ → UNREAD
 * or UNREAD → READ.
 */

const olderCachedEmails =
    mailnovaEmails.filter(
        email =>
            !latestIds.has(
                String(
                    email.id
                )
            )
    );

/*
 * Merge everything through the protected
 * deduplication function.
 *
 * mailnovaReadStateOverrides always wins
 * for a manually changed email.
 */

mailnovaEmails =
    deduplicateMailnovaEmails([
        ...latestEmails,
        ...olderCachedEmails
    ]);

/*
 * Final safety pass:
 * never allow a local MailNova read/unread
 * override to be lost during sync.
 */

mailnovaEmails =
    mailnovaEmails.map(
        email => {

            const id =
                String(
                    email?.id || ""
                );

            if (
                id &&
                mailnovaReadStateOverrides.has(id)
            ) {

                return {

                    ...email,

                    unread:
                        Boolean(
                            mailnovaReadStateOverrides.get(
                                id
                            )
                        )

                };

            }

            return email;

        }
    );

                /*
                   Render only the first-page result.
                   This gives immediate visual feedback.
                */

                applyAllMailnovaFilters();


                if (
                    typeof startMailnovaAIAnalysis ===
                    "function"
                ) {
                    setTimeout(() => {
                        startMailnovaAIAnalysis(
                            latestEmails
                        );
                    }, 300);
                }


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

                 startRemainingMailSync(
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

                  startRemainingMailSync(
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
                    25
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
/* =========================================
   DEDUPLICATE EMAILS
   ========================================= */

function deduplicateMailnovaEmails(
    emails
) {

    const map =
        new Map();

    for (
        const email of emails || []
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
         * IMPORTANT:
         * If the user has manually changed
         * Read / Unread state in MailNova,
         * NEVER allow a Gmail background sync
         * response to overwrite that state.
         */

        let finalEmail = {
            ...email
        };

        if (
            mailnovaReadStateOverrides.has(id)
        ) {

            finalEmail.unread =
                Boolean(
                    mailnovaReadStateOverrides.get(id)
                );

        }

        /*
         * Always store the newest email object,
         * but preserve the local read state above.
         */

        map.set(
            id,
            finalEmail
        );

    }

    return Array.from(
        map.values()
    );

}

/* =========================================
   REFRESH WORKSPACE
========================================= */

/* =========================================
   REFRESH WORKSPACE
========================================= */
/* =========================================
   REFRESH BUTTON ANIMATION
========================================= */

function animateMailnovaRefreshButton() {

    const button =
        document.getElementById(
            "mn-refresh"
        );

    if (!button) {
        return;
    }

    /*
       Restart animation even if the button
       was already animating.
    */
    button.classList.remove(
        "mailnova-refreshing"
    );

    /*
       Force browser reflow so the animation
       starts again immediately.
    */
    void button.offsetWidth;

    button.classList.add(
        "mailnova-refreshing"
    );

}


/* =========================================
   REFRESH WORKSPACE
========================================= */
/* =========================================
   REFRESH BUTTON ANIMATION
========================================= */

function animateMailnovaRefreshButton() {

    const button =
        document.getElementById(
            "mn-refresh"
        );

    if (!button) {
        return;
    }

    /*
       Restart animation every time
       user clicks the button.
    */

    button.classList.remove(
        "mailnova-refreshing"
    );

    void button.offsetWidth;

    button.classList.add(
        "mailnova-refreshing"
    );

}


/* =========================================
   REFRESH WORKSPACE
========================================= */
/* =========================================
   MAILNOVA REFRESH VISUAL
========================================= */

function restartMailnovaRefreshAnimation() {

    const button =
        document.getElementById(
            "mn-refresh"
        );

    if (!button) {
        return;
    }

    /*
       Force animation restart.

       Removing + re-adding the class forces
       the browser to start the animation again.
    */

    button.classList.remove(
        "mailnova-refreshing"
    );

    void button.offsetWidth;

    button.classList.add(
        "mailnova-refreshing"
    );

}


/* =========================================
   REFRESH WORKSPACE
========================================= */

/* =========================================
   REFRESH WORKSPACE
   FINAL FAST VERSION
========================================= */

async function refreshWorkspace() {

    const button =
        document.getElementById(
            "mn-refresh"
        );

    /*
       -----------------------------------------
       VISUAL REFRESH ANIMATION
       -----------------------------------------
       Always give the user immediate feedback.
    */

    if (button) {

        /*
           Restart animation even if the user
           clicks again after a previous refresh.
        */

        button.classList.remove(
            "mailnova-refreshing"
        );

        void button.offsetWidth;

        button.classList.add(
            "mailnova-refreshing"
        );

        button.setAttribute(
            "aria-busy",
            "true"
        );

        button.setAttribute(
            "title",
            "Refreshing emails..."
        );

        /*
           EXACTLY 7 ROTATIONS
           CSS animation duration:
           0.28s × 7 = 1.96 seconds
        */

        clearTimeout(
            window.__mailnovaRefreshVisualTimer
        );

        window.__mailnovaRefreshVisualTimer =
            setTimeout(
                () => {

                    button.classList.remove(
                        "mailnova-refreshing"
                    );

                    /*
                       Keep aria-busy only while
                       actual network sync is running.
                    */

                    if (
                        !mailnovaIsRefreshing
                    ) {

                        button.removeAttribute(
                            "aria-busy"
                        );

                        button.setAttribute(
                            "title",
                            "Refresh emails"
                        );

                    }

                },
                2000
            );

    }

    /*
       -----------------------------------------
       IF A SYNC IS ALREADY RUNNING
       -----------------------------------------

       Do NOT start another Gmail sync.

       The animation above still plays so
       the button feels responsive.
    */

    if (
        mailnovaIsRefreshing
    ) {

        return;

    }

    mailnovaIsRefreshing =
        true;

    /*
       -----------------------------------------
       SCROLL TO TOP
       -----------------------------------------
    */

    const emailList =
        workspace
            ? workspace.querySelector(
                ".mailnova-email-list"
            )
            : document.querySelector(
                ".mailnova-email-list"
            );

    if (emailList) {

        emailList.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    /*
       -----------------------------------------
       MANUAL REFRESH FLAG
       -----------------------------------------
    */

    window.__mailnovaManualRefresh =
        true;

    try {

        console.log(
            "MailNova: Manual refresh started..."
        );

        /*
           IMPORTANT:
           syncMailnovaInBackground() now waits
           ONLY for the first Gmail page.

           Remaining pages continue in background.
        */

        await syncMailnovaInBackground();

        console.log(
            "MailNova: First page refreshed successfully."
        );

        /*
           Scroll latest emails to top.
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

    }

    catch (error) {

        console.error(
            "MailNova: Manual refresh failed:",
            error
        );

    }

    finally {

        window.__mailnovaManualRefresh =
            false;

        /*
           -----------------------------------------
           REAL SYNC FINISHED
           -----------------------------------------
        */

        mailnovaIsRefreshing =
            false;

        /*
           Do NOT force the animation here.
           It already stops after exactly 7 spins.
        */

        if (button) {

            button.removeAttribute(
                "aria-busy"
            );

            button.disabled =
                false;

            button.setAttribute(
                "title",
                "Refresh emails"
            );

        }

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

        if (
            typeof searchMailnovaEmails ===
            "function"
        ) {

            filtered =
                searchMailnovaEmails(
                    filtered,
                    searchQuery
                );

        }

        else {

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
       CHECK CATEGORY DETECTION SETTING
    ===================================== */

    const categoryDetectionEnabled =
        typeof isMailnovaCategoryDetectionEnabled ===
        "function"
            ? isMailnovaCategoryDetectionEnabled()
            : true;


    /* =====================================
       RESET CATEGORY FILTER WHEN OFF
    ===================================== */

    if (
        !categoryDetectionEnabled &&
        typeof mailnovaFilterState !==
        "undefined" &&
        mailnovaFilterState
    ) {

        mailnovaFilterState.category =
            "All";

    }


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
       SHOW / HIDE CATEGORY CHIPS
    ===================================== */

    const categoryChips =
        bar.querySelectorAll(
            '.mailnova-chip[data-category]'
        );


    categoryChips.forEach(
        (chip) => {

            const category =
                chip.dataset.category;


            /*
             * All is ALWAYS visible.
             */

            if (
                category ===
                "All"
            ) {

                chip.style.removeProperty(
                    "display"
                );

                return;

            }


            /*
             * Category Detection OFF
             *
             * Hide every category chip.
             */

            if (
                !categoryDetectionEnabled
            ) {

                chip.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            /*
             * Category Detection ON
             *
             * Restore every category chip.
             */

            else {

                chip.style.removeProperty(
                    "display"
                );

            }

        }
    );


    /* =====================================
       UPDATE COUNTS + ACTIVE STATE
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
    e.target.closest(".mn-mark-read");

if (markReadButton) {

    e.preventDefault();
    e.stopPropagation();

    const emailId =
        markReadButton.dataset.id;

    console.log(
        "MailNova: READ/UNREAD CLICK:",
        emailId
    );

    if (!emailId) {
        console.warn(
            "MailNova: Email ID missing."
        );
        return;
    }

    const email =
        mailnovaEmails.find(
            mail =>
                String(mail.id) ===
                String(emailId)
        );

    if (!email) {
        console.warn(
            "MailNova: Email object not found:",
            emailId
        );
        return;
    }

    /*
       ====================================
       READ/UNREAD CURRENT STATE
    ====================================
    */

    const previousUnread =
        Boolean(email.unread);

    const newUnread =
        !previousUnread;

    console.log(
        "MailNova: Toggle:",
        previousUnread
            ? "UNREAD -> READ"
            : "READ -> UNREAD"
    );

    /*
       ====================================
       UPDATE LOCAL STATE FIRST
    ====================================
    */

    email.unread =
        newUnread;

    mailnovaReadStateOverrides.set(
        String(emailId),
        newUnread
    );

    /*
       ====================================
       UPDATE UI IMMEDIATELY
    ====================================
    */

    updateMailnovaReadUnreadCard(
        emailId,
        newUnread
    );

    /*
       ====================================
       MAKE BUTTON CLICKABLE AGAIN
       IMMEDIATELY

       IMPORTANT:
       Do NOT wait for Gmail API.
    ====================================
    */

    const currentButton =
        document.querySelector(
            `.mn-mark-read[data-id="${CSS.escape(String(emailId))}"]`
        );

    if (currentButton) {

        currentButton.disabled =
            false;

        currentButton.dataset.loading =
            "false";

        currentButton.style.pointerEvents =
            "auto";

    }

    /*
       ====================================
       SAVE LOCAL STATE
    ====================================
    */

    saveMailnovaReadStateOverride(
        emailId,
        newUnread
    ).catch(
        error => {
            console.warn(
                "MailNova: Override save failed:",
                error
            );
        }
    );

    saveMailnovaEmailCache(
        mailnovaEmails
    ).catch(
        error => {
            console.warn(
                "MailNova: Cache save failed:",
                error
            );
        }
    );

    /*
       ====================================
       CALL GMAIL API IN BACKGROUND

       IMPORTANT:
       DO NOT await here.
    ====================================
    */

    if (newUnread) {

        console.log(
            "MailNova: Calling Gmail MARK AS UNREAD:",
            emailId
        );

        markEmailAsUnread(
            emailId
        )
        .then(
            result => {

                if (
                    result &&
                    result.success
                ) {

                    console.log(
                        "MailNova: Gmail MARK AS UNREAD SUCCESS:",
                        emailId
                    );

                    return;
                }

                console.error(
                    "MailNova: Gmail MARK AS UNREAD FAILED:",
                    result?.error ||
                    result?.message ||
                    "Unknown error"
                );

                /*
                   ROLLBACK
                */

                email.unread =
                    previousUnread;

                mailnovaReadStateOverrides.set(
                    String(emailId),
                    previousUnread
                );

                updateMailnovaReadUnreadCard(
                    emailId,
                    previousUnread
                );

                saveMailnovaEmailCache(
                    mailnovaEmails
                ).catch(
                    () => {}
                );

            }
        )
        .catch(
            error => {

                console.error(
                    "MailNova: MARK AS UNREAD ERROR:",
                    error
                );

                /*
                   ROLLBACK
                */

                email.unread =
                    previousUnread;

                mailnovaReadStateOverrides.set(
                    String(emailId),
                    previousUnread
                );

                updateMailnovaReadUnreadCard(
                    emailId,
                    previousUnread
                );

            }
        );

    }

    else {

        console.log(
            "MailNova: Calling Gmail MARK AS READ:",
            emailId
        );

        markEmailAsRead(
            emailId
        )
        .then(
            result => {

                if (
                    result &&
                    result.success
                ) {

                    console.log(
                        "MailNova: Gmail MARK AS READ SUCCESS:",
                        emailId
                    );

                    return;
                }

                console.error(
                    "MailNova: Gmail MARK AS READ FAILED:",
                    result?.error ||
                    result?.message ||
                    "Unknown error"
                );

                /*
                   ROLLBACK
                */

                email.unread =
                    previousUnread;

                mailnovaReadStateOverrides.set(
                    String(emailId),
                    previousUnread
                );

                updateMailnovaReadUnreadCard(
                    emailId,
                    previousUnread
                );

                saveMailnovaEmailCache(
                    mailnovaEmails
                ).catch(
                    () => {}
                );

            }
        )
        .catch(
            error => {

                console.error(
                    "MailNova: MARK AS READ ERROR:",
                    error
                );

                /*
                   ROLLBACK
                */

                email.unread =
                    previousUnread;

                mailnovaReadStateOverrides.set(
                    String(emailId),
                    previousUnread
                );

                updateMailnovaReadUnreadCard(
                    emailId,
                    previousUnread
                );

            }
        );

    }

    return;
}
            /* =====================================================
               VIEW
            ===================================================== */

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


            /* =====================================================
               REPLY
            ===================================================== */

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


            /* =====================================================
               ASK AI
            ===================================================== */

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
   INSTANT UI UPDATE
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


    const unread =
        Boolean(
            isUnread
        );


    /* =====================================
       CARD STATE
    ===================================== */

    card.classList.remove(
        "mailnova-email-unread",
        "mailnova-email-read"
    );

    card.classList.add(
        unread
            ? "mailnova-email-unread"
            : "mailnova-email-read"
    );


    card.dataset.unread =
        unread
            ? "true"
            : "false";


    /* =====================================
       STATUS BADGE
    ===================================== */

    const statusBadge =
        card.querySelector(
            ".mailnova-read-status"
        );


    if (statusBadge) {

        statusBadge.textContent =
            unread
                ? "UNREAD"
                : "READ";

        statusBadge.dataset.unread =
            unread
                ? "true"
                : "false";

        statusBadge.classList.remove(
            "unread",
            "read"
        );

        statusBadge.classList.add(
            unread
                ? "unread"
                : "read"
        );

        statusBadge.setAttribute(
            "aria-label",
            unread
                ? "Mark as read"
                : "Mark as unread"
        );

    }


    /* =====================================
       GREEN / GREY STATUS DOT
    ===================================== */

    const statusDot =
        card.querySelector(
            ".mailnova-read-status-dot"
        );


    if (statusDot) {

        statusDot.classList.remove(
            "unread",
            "read"
        );

        statusDot.classList.add(
            unread
                ? "unread"
                : "read"
        );

        statusDot.dataset.unread =
            unread
                ? "true"
                : "false";

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

actionButton.disabled =
    false;

actionButton.dataset.loading =
    "false";

actionButton.style.pointerEvents =
    "auto";


    actionButton.dataset.unread =
        unread
            ? "true"
            : "false";


    actionButton.setAttribute(
        "aria-label",
        unread
            ? "Mark as read"
            : "Mark as unread"
    );


    /* =====================================
       ICON
    ===================================== */

    actionButton.innerHTML =
        unread
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

/* =========================================
   LIVE WORKSPACE SETTINGS BRIDGE
========================================= */

/* =========================================
   SETTINGS CHANGE HELPER
========================================= */

function handleMailnovaWorkspaceSettingChange(
    key,
    value
) {

    console.log(
        "MailNova: Workspace setting changed:",
        key,
        value
    );


    /* =========================================
       CATEGORY DETECTION
    ========================================= */

    if (
        key === "categoryDetection"
    ) {

        if (
            value === true &&
            typeof refreshMailnovaCategories ===
            "function"
        ) {

            refreshMailnovaCategories();

        }


        if (
            typeof applyAllMailnovaFilters ===
            "function"
        ) {

            applyAllMailnovaFilters();

        }


        return;

    }


    /* =========================================
       AI SETTINGS
    ========================================= */

    if (
        key === "aiSummary" ||
        key === "askAI" ||
        key === "smartReply"
    ) {

        console.log(
            "MailNova: AI setting changed:",
            key,
            value
        );


        /*
         * Re-render the currently visible
         * email cards immediately.
         */

        if (
            typeof applyAllMailnovaFilters ===
            "function"
        ) {

            applyAllMailnovaFilters();

        }

        else if (
            typeof renderEmails ===
            "function" &&
            typeof mailnovaEmails !==
            "undefined" &&
            Array.isArray(mailnovaEmails)
        ) {

            renderEmails(
                mailnovaEmails
            );

        }


        return;

    }


    /* =========================================
       EMAIL LOADING
    ========================================= */

    if (
        key === "emailLoading"
    ) {

        console.log(
            "MailNova: Email Loading mode changed:",
            value
        );


        /*
         * The selected mode is automatically
         * used by the next sync.
         *
         * If COMPLETE is selected,
         * immediately continue with a fresh
         * full sync.
         */

        if (
            value === "complete" &&
            workspace
        ) {

            console.log(
                "MailNova: Complete loading selected. Starting full sync..."
            );


            try {

                syncMailnovaInBackground();

            }

            catch (error) {

                console.warn(
                    "MailNova: Complete loading sync failed:",
                    error
                );

            }

        }


        return;

    }


    /* =========================================
       BACKGROUND SYNC
    ========================================= */

    if (
        key === "backgroundSync"
    ) {

        console.log(
            "MailNova: Background Sync changed:",
            value
        );


        /*
         * Background Sync ON
         */

        if (
            value === true &&
            workspace
        ) {

            console.log(
                "MailNova: Background Sync enabled. Starting sync..."
            );


            try {

                syncMailnovaInBackground();

            }

            catch (error) {

                console.warn(
                    "MailNova: Background Sync could not start:",
                    error
                );

            }

        }


        /*
         * Background Sync OFF
         *
         * Existing running sync is not cancelled.
         * Future automatic syncs will respect the
         * disabled setting.
         */

        if (
            value === false
        ) {

            console.log(
                "MailNova: Background Sync disabled."
            );

        }


        return;

    }


    /* =========================================
       PRIORITY FOCUS
    ========================================= */

    if (
        key === "priorityFocus"
    ) {

        console.log(
            "MailNova: Priority Focus changed:",
            value
        );


        if (
            typeof refreshMailnovaPriorityRanking ===
            "function"
        ) {

            refreshMailnovaPriorityRanking();

        }


        return;

    }


    /* =========================================
       UNKNOWN / OTHER SETTINGS
    ========================================= */

    console.log(
        "MailNova: No workspace action required for:",
        key
    );

}


/* =========================================
   SETTINGS EVENT LISTENER
========================================= */

if (
    !window.__mailnovaWorkspaceSettingBridge
) {

    window.__mailnovaWorkspaceSettingBridge =
        true;


    window.addEventListener(
        "mailnova-setting-changed",
        event => {

            const detail =
                event.detail || {};


            if (
                !detail.key
            ) {

                return;

            }


            handleMailnovaWorkspaceSettingChange(
                detail.key,
                detail.value
            );

        }
    );

}


/* =========================================
   SETTINGS EVENT LISTENER
========================================= */

if (
    !window.__mailnovaWorkspaceSettingBridge
) {

    window.__mailnovaWorkspaceSettingBridge =
        true;


    window.addEventListener(
        "mailnova-setting-changed",
        event => {

            const detail =
                event.detail || {};


            if (
                !detail.key
            ) {

                return;

            }


            handleMailnovaWorkspaceSettingChange(
                detail.key,
                detail.value
            );

        }
    );

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
/* =========================================================
   MAILNOVA SETTINGS
   Professional Settings Modal
========================================================= */

const MAILNOVA_SETTINGS_KEY =
    "mailnova_settings";


const MAILNOVA_DEFAULT_SETTINGS = {

    theme: "light",

    /* Appearance */
    compactMode: false,
    glassEffect: true,

    /* Email Preferences */
    autoOpenWorkspace: true,
    unreadNotifications: true,
    categoryDetection: true,
    backgroundSync: true,

    /* Priority */
    priorityFocus: "unread",

    /* AI */
    aiSummary: true,
    askAI: true,
    smartReply: true,

    /* Loading */
    emailLoading: "fast",

    /* Notifications */
    importantNotifications: true,
    notificationBadge: true

};


let mailnovaSettings = {
    ...MAILNOVA_DEFAULT_SETTINGS
};


/* =========================================================
   LOAD
========================================================= */

async function loadMailnovaSettings() {

    try {

        const result =
            await chrome.storage.local.get(
                MAILNOVA_SETTINGS_KEY
            );


        mailnovaSettings = {

            ...MAILNOVA_DEFAULT_SETTINGS,

            ...(result[
                MAILNOVA_SETTINGS_KEY
            ] || {})

        };

    }

    catch (error) {

        console.error(
            "MailNova Settings Load Error:",
            error
        );


        mailnovaSettings = {
            ...MAILNOVA_DEFAULT_SETTINGS
        };

    }


    return mailnovaSettings;

}


/* =========================================================
   SAVE
========================================================= */

async function saveMailnovaSettings() {

    try {

        await chrome.storage.local.set({

            [MAILNOVA_SETTINGS_KEY]:
                mailnovaSettings

        });


        console.log(
            "MailNova: Settings saved automatically."
        );


        return true;

    }

    catch (error) {

        console.error(
            "MailNova Settings Save Error:",
            error
        );


        return false;

    }

}


/* =========================================================
   DISPATCH SETTING CHANGE
========================================================= */

function dispatchMailnovaSettingChange(
    key,
    value
) {

    /*
       Workspace listens to this event.

       This keeps settings.js independent from
       workspace.js while allowing immediate
       dashboard updates.
    */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "mailnova-setting-changed",
                {
                    detail: {
                        key,
                        value
                    }
                }
            )
        );

    }

    catch (error) {

        console.warn(
            "MailNova: Could not dispatch setting change:",
            error
        );

    }

}


/* =========================================================
   REFRESH CURRENT EMAIL CARDS
========================================================= */

function refreshMailnovaCurrentCards() {

    if (
        typeof applyAllMailnovaFilters ===
        "function"
    ) {

        applyAllMailnovaFilters();

        return;

    }


    if (
        typeof mailnovaEmails !==
        "undefined" &&
        Array.isArray(mailnovaEmails) &&
        typeof renderEmails ===
        "function"
    ) {

        renderEmails(
            mailnovaEmails
        );

    }

}


/* =========================================================
   UPDATE
========================================================= */

async function updateMailnovaSetting(
    key,
    value
) {

    /*
       Ignore unknown settings.
       This prevents accidental storage pollution.
    */

    if (
        !Object.prototype.hasOwnProperty.call(
            MAILNOVA_DEFAULT_SETTINGS,
            key
        )
    ) {

        console.warn(
            "MailNova: Unknown setting:",
            key
        );

        return;

    }


    mailnovaSettings[key] =
        value;


    await saveMailnovaSettings();


    /* =====================================
       APPLY LOCAL SETTING
    ===================================== */

    applyMailnovaSetting(
        key,
        value
    );


    /* =====================================
       DISPATCH WORKSPACE EVENT
    ===================================== */

    dispatchMailnovaSettingChange(
        key,
        value
    );


    /* =====================================
       AI CARD SETTINGS
    ===================================== */

    if (
        key === "aiSummary" ||
        key === "askAI" ||
        key === "smartReply"
    ) {

        refreshMailnovaCurrentCards();

    }


    /* =====================================
       CATEGORY DETECTION
    ===================================== */

    if (
        key ===
        "categoryDetection"
    ) {

        /*
           When enabling category detection,
           immediately recalculate categories.
        */

        if (
            value === true &&
            typeof refreshMailnovaCategories ===
            "function"
        ) {

            refreshMailnovaCategories();

        }


        refreshMailnovaCurrentCards();

    }


    /* =====================================
       NOTIFICATION SETTINGS
    ===================================== */

    if (
        key ===
        "importantNotifications" ||
        key ===
        "notificationBadge" ||
        key ===
        "unreadNotifications"
    ) {

        applyMailnovaNotificationSettings();

    }


    /* =====================================
       UI
    ===================================== */

    updateSettingsUI();

    showSettingsSaved();

}


/* =========================================================
   APPLY SETTING
========================================================= */

function applyMailnovaSetting(
    key,
    value
) {

    /* =====================================
       THEME
    ===================================== */

    if (
        key ===
        "theme"
    ) {

        applyMailnovaTheme(
            value
        );

    }


    /* =====================================
       PRIORITY FOCUS
    ===================================== */

    if (
        key ===
        "priorityFocus"
    ) {

        if (
            typeof setMailnovaPriorityFocus ===
            "function"
        ) {

            setMailnovaPriorityFocus(
                value
            );

        }


        if (
            typeof refreshMailnovaPriorityRanking ===
            "function"
        ) {

            refreshMailnovaPriorityRanking();

        }

    }


    /* =====================================
       COMPACT MODE
    ===================================== */

    if (
        key ===
        "compactMode"
    ) {

        const workspace =
            document.getElementById(
                "mailnova-workspace"
            );


        if (workspace) {

            workspace.classList.toggle(
                "mailnova-compact-mode",
                Boolean(value)
            );

        }

    }


    /* =====================================
       GLASS EFFECT
    ===================================== */

    if (
        key ===
        "glassEffect"
    ) {

        const workspace =
            document.getElementById(
                "mailnova-workspace"
            );


        if (workspace) {

            workspace.classList.toggle(
                "mailnova-glass-effect",
                Boolean(value)
            );

        }

    }


    /* =====================================
       AUTO OPEN
       No current DOM change required.
       Saved value is used by content.js.
    ===================================== */

    if (
        key ===
        "autoOpenWorkspace"
    ) {

        console.log(
            "MailNova: Auto Open Workspace:",
            value
        );

    }


    /* =====================================
       BACKGROUND SYNC
    ===================================== */

    if (
        key ===
        "backgroundSync"
    ) {

        console.log(
            "MailNova: Background Sync:",
            value
        );

    }


    /* =====================================
       EMAIL LOADING
    ===================================== */

    if (
        key ===
        "emailLoading"
    ) {

        console.log(
            "MailNova: Email Loading Mode:",
            value
        );

    }

}


/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

function applyMailnovaNotificationSettings() {

    /*
       The current project does not have a separate
       notification engine yet.

       These settings are still applied to the
       MailNova UI state so future notification
       logic can consume them directly.
    */

    const workspace =
        document.getElementById(
            "mailnova-workspace"
        );


    if (!workspace) {

        return;

    }


    workspace.dataset.notificationsEnabled =
        mailnovaSettings.unreadNotifications
            ? "true"
            : "false";


    workspace.dataset.importantNotifications =
        mailnovaSettings.importantNotifications
            ? "true"
            : "false";


    workspace.dataset.notificationBadge =
        mailnovaSettings.notificationBadge
            ? "true"
            : "false";


    /*
       If a notification refresh function exists,
       use it without making it mandatory.
    */

    if (
        typeof refreshMailnovaNotifications ===
        "function"
    ) {

        try {

            refreshMailnovaNotifications();

        }

        catch (error) {

            console.warn(
                "MailNova: Notification refresh failed:",
                error
            );

        }

    }

}


/* =========================================================
   EFFECTIVE THEME
========================================================= */

function getMailnovaEffectiveTheme() {

    if (
        mailnovaSettings.theme ===
        "system"
    ) {

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";

    }


    return mailnovaSettings.theme;

}


/* =========================================================
   THEME
========================================================= */

function applyMailnovaTheme(
    theme
) {

    const workspace =
        document.getElementById(
            "mailnova-workspace"
        );


    if (!workspace) {

        return;

    }


    const effectiveTheme =
        theme === "system"
            ? (
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light"
            )
            : theme;


    workspace.classList.remove(
        "mailnova-theme-light",
        "mailnova-theme-dark"
    );


    workspace.classList.add(
        effectiveTheme === "dark"
            ? "mailnova-theme-dark"
            : "mailnova-theme-light"
    );

}


/* =========================================================
   APPEARANCE SETTINGS
========================================================= */

function applyMailnovaAppearanceSettings() {

    const workspace =
        document.getElementById(
            "mailnova-workspace"
        );


    if (!workspace) {

        return;

    }


    workspace.classList.toggle(
        "mailnova-compact-mode",
        Boolean(
            mailnovaSettings.compactMode
        )
    );


    workspace.classList.toggle(
        "mailnova-glass-effect",
        Boolean(
            mailnovaSettings.glassEffect
        )
    );

}


/* =========================================================
   SAVED INDICATOR
========================================================= */

function showSettingsSaved() {

    const element =
        document.getElementById(
            "mailnova-settings-saved"
        );


    if (!element) {

        return;

    }


    element.classList.add(
        "show"
    );


    clearTimeout(
        window.__mailnovaSavedTimer
    );


    window.__mailnovaSavedTimer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            1400
        );

}


/* =========================================================
   SETTING ROW
========================================================= */

function createSettingRow(
    key,
    icon,
    title,
    description
) {

    return `

        <div
            class="mn-setting-row"
            data-setting="${key}"
        >

            <div class="mn-setting-row-left">

                <div class="mn-setting-icon">
                    ${icon}
                </div>

                <div class="mn-setting-text">

                    <div class="mn-setting-title">
                        ${title}
                    </div>

                    <div class="mn-setting-description">
                        ${description}
                    </div>

                </div>

            </div>


            <button
                type="button"
                class="mn-setting-switch"
                data-setting="${key}"
                aria-label="${title}"
            >

                <span></span>

            </button>

        </div>

    `;

}


/* =========================================================
   PRIORITY FOCUS OPTION
========================================================= */

function createPriorityFocusOption(
    value,
    icon,
    title,
    description
) {

    return `

        <button
            type="button"
            class="mn-priority-focus-option"
            data-priority-focus="${value}"
        >

            <span class="mn-priority-focus-icon">
                ${icon}
            </span>

            <span class="mn-priority-focus-text">

                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>

            </span>

            <span class="mn-priority-focus-check">
                ✓
            </span>

        </button>

    `;

}


/* =========================================================
   THEME CARD
========================================================= */

function createThemeCard(
    value,
    icon,
    title,
    description
) {

    return `

        <button
            type="button"
            class="mn-theme-card"
            data-theme="${value}"
        >

            <div class="mn-theme-icon">
                ${icon}
            </div>

            <div class="mn-theme-name">
                ${title}
            </div>

            <div class="mn-theme-description">
                ${description}
            </div>

            <div class="mn-theme-check">
                ✓
            </div>

        </button>

    `;

}


/* =========================================================
   LOADING OPTION
========================================================= */

function createLoadingOption(
    value,
    icon,
    title,
    description
) {

    return `

        <button
            type="button"
            class="mn-loading-option"
            data-loading="${value}"
        >

            <span class="mn-loading-icon">
                ${icon}
            </span>

            <span class="mn-loading-text">

                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>

            </span>

        </button>

    `;

}


/* =========================================================
   CREATE MODAL
========================================================= */

function createMailnovaSettingsModal() {

    const workspace =
        document.getElementById(
            "mailnova-workspace"
        );


    if (!workspace) {

        return;

    }


    if (
        document.getElementById(
            "mailnova-settings-overlay"
        )
    ) {

        return;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "mailnova-settings-overlay";


    overlay.innerHTML = `

        <div class="mailnova-settings-modal">

            <!-- LEFT SIDEBAR -->

            <aside class="mn-settings-sidebar">

                <div class="mn-settings-brand">

                    <div class="mn-settings-brand-icon">
                        ⚙
                    </div>

                    <div>

                        <div class="mn-settings-brand-title">
                            Settings
                        </div>

                        <div class="mn-settings-brand-subtitle">
                            Customize MailNova
                        </div>

                    </div>

                </div>


                <nav class="mn-settings-navigation">

                    <button
                        class="mn-settings-nav-item active"
                        data-section="appearance"
                    >

                        <span class="mn-nav-icon">
                            ◉
                        </span>

                        <span>
                            Appearance
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="email"
                    >

                        <span class="mn-nav-icon">
                            ✉
                        </span>

                        <span>
                            Email Preferences
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="ai"
                    >

                        <span class="mn-nav-icon">
                            ◈
                        </span>

                        <span>
                            AI Intelligence
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="loading"
                    >

                        <span class="mn-nav-icon">
                            ⚡
                        </span>

                        <span>
                            Email Loading
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="notifications"
                    >

                        <span class="mn-nav-icon">
                            ♢
                        </span>

                        <span>
                            Notifications
                        </span>

                    </button>

                </nav>


                <div class="mn-settings-sidebar-footer">

                    <div
                        id="mailnova-settings-saved"
                        class="mailnova-settings-saved"
                    >
                        ✓
                    </div>

                    <span>
                        Saved automatically
                    </span>

                </div>

            </aside>


            <!-- RIGHT SIDE -->

            <main class="mn-settings-main">

                <div class="mn-settings-main-header">

                    <div>

                        <div
                            id="mn-settings-section-title"
                            class="mn-main-title"
                        >
                            Appearance
                        </div>

                        <div
                            id="mn-settings-section-description"
                            class="mn-main-description"
                        >
                            Choose how MailNova looks and feels.
                        </div>

                    </div>


                    <button
                        type="button"
                        id="mn-settings-modal-close"
                        class="mn-settings-modal-close"
                    >
                        ✕
                    </button>

                </div>


                <!-- APPEARANCE -->

                <section
                    class="mn-settings-section-content active"
                    data-content="appearance"
                >

                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ◉
                        </span>

                        Theme

                    </div>

                    <div class="mn-content-subheading">
                        Choose your preferred theme
                    </div>


                    <div class="mn-theme-grid">

                        ${createThemeCard(
                            "light",
                            "☀",
                            "Light",
                            "Clean & bright"
                        )}

                        ${createThemeCard(
                            "dark",
                            "◐",
                            "Dark",
                            "Easy on eyes"
                        )}

                        ${createThemeCard(
                            "system",
                            "▣",
                            "System",
                            "Follow device"
                        )}

                    </div>


                    <div class="mn-divider"></div>


                    ${createSettingRow(
                        "compactMode",
                        "▦",
                        "Compact Mode",
                        "Reduce spacing for more content."
                    )}


                    ${createSettingRow(
                        "glassEffect",
                        "◇",
                        "Glass Effect",
                        "Enable blur and transparency."
                    )}

                </section>


                <!-- EMAIL -->

                <section
                    class="mn-settings-section-content"
                    data-content="email"
                >

                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ✉
                        </span>

                        Email Behavior

                    </div>

                    <div class="mn-content-subheading">
                        Control how MailNova handles your inbox.
                    </div>


                    ${createSettingRow(
                        "autoOpenWorkspace",
                        "↗",
                        "Auto Open Workspace",
                        "Open MailNova automatically with Gmail."
                    )}


                    ${createSettingRow(
                        "unreadNotifications",
                        "●",
                        "Unread Notifications",
                        "Show notifications for unread emails."
                    )}


                    ${createSettingRow(
                        "categoryDetection",
                        "◇",
                        "Category Detection",
                        "Automatically classify emails."
                    )}


                    ${createSettingRow(
                        "backgroundSync",
                        "↻",
                        "Background Sync",
                        "Keep inbox data updated."
                    )}


                    <div class="mn-divider"></div>


                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ★
                        </span>

                        Priority Focus

                    </div>

                    <div class="mn-content-subheading">
                        Choose which emails should receive extra priority.
                    </div>


                    <div class="mn-priority-focus-grid">

                        ${createPriorityFocusOption(
                            "unread",
                            "●",
                            "Unread First",
                            "Give unread emails a priority boost."
                        )}

                        ${createPriorityFocusOption(
                            "all",
                            "✦",
                            "All Emails",
                            "Rank emails without a read/unread preference."
                        )}

                        ${createPriorityFocusOption(
                            "read",
                            "✓",
                            "Read First",
                            "Give already-read emails a priority boost."
                        )}

                    </div>

                </section>


                <!-- AI -->

                <section
                    class="mn-settings-section-content"
                    data-content="ai"
                >

                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ◈
                        </span>

                        AI Features

                    </div>

                    <div class="mn-content-subheading">
                        Manage MailNova AI features.
                    </div>


                    ${createSettingRow(
                        "aiSummary",
                        "✦",
                        "AI Email Summary",
                        "Generate intelligent email summaries."
                    )}

                    ${createSettingRow(
                        "askAI",
                        "◌",
                        "Ask AI",
                        "Ask questions about your emails."
                    )}

                    ${createSettingRow(
                        "smartReply",
                        "↩",
                        "Smart Reply",
                        "Generate intelligent reply suggestions."
                    )}

                </section>


                <!-- LOADING -->

                <section
                    class="mn-settings-section-content"
                    data-content="loading"
                >

                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ⚡
                        </span>

                        Loading Mode

                    </div>

                    <div class="mn-content-subheading">
                        Choose how MailNova loads your inbox.
                    </div>


                    <div class="mn-loading-grid">

                        ${createLoadingOption(
                            "fast",
                            "⚡",
                            "Fast",
                            "First emails immediately."
                        )}

                        ${createLoadingOption(
                            "balanced",
                            "≈",
                            "Balanced",
                            "Smooth background loading."
                        )}

                        ${createLoadingOption(
                            "complete",
                            "▣",
                            "Complete",
                            "Load all Gmail pages."
                        )}

                    </div>


                    <div
                        id="mn-loading-hint"
                        class="mn-loading-hint"
                    ></div>

                </section>


                <!-- NOTIFICATIONS -->

                <section
                    class="mn-settings-section-content"
                    data-content="notifications"
                >

                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">
                            ♢
                        </span>

                        Notification Settings

                    </div>

                    <div class="mn-content-subheading">
                        Control MailNova notifications.
                    </div>


                    ${createSettingRow(
                        "importantNotifications",
                        "★",
                        "Important Emails",
                        "Notify you about important emails."
                    )}

                    ${createSettingRow(
                        "notificationBadge",
                        "●",
                        "Notification Badge",
                        "Show unread count on MailNova."
                    )}

                </section>

            </main>

        </div>

    `;


    workspace.appendChild(
        overlay
    );


    setupMailnovaSettingsControls();

}


/* =========================================================
   NAVIGATION + CONTROLS
========================================================= */

/* =========================================================
   SETTINGS CONTROLS
   FINAL STABLE VERSION
   Prevents Gmail / Workspace drag interference
========================================================= */

function setupMailnovaSettingsControls() {

    const overlay =
        document.getElementById(
            "mailnova-settings-overlay"
        );

    if (!overlay) {
        return;
    }


    /* =====================================================
       PREVENT WORKSPACE DRAG FROM STEALING SETTINGS EVENTS
    ===================================================== */

    if (
        overlay.dataset.settingsControlsReady ===
        "true"
    ) {
        return;
    }

    overlay.dataset.settingsControlsReady =
        "true";


    /* =====================================================
       POINTER DOWN CAPTURE
       Stops workspace drag handlers before they receive
       the event.
    ===================================================== */

    overlay.addEventListener(
        "pointerdown",
        function (event) {

            const control =
                event.target.closest(
                    ".mn-settings-nav-item, " +
                    ".mn-theme-card, " +
                    ".mn-setting-switch, " +
                    ".mn-priority-focus-option, " +
                    ".mn-loading-option, " +
                    ".mn-settings-modal-close"
                );


            if (!control) {
                return;
            }


            /*
               Important:
               Do NOT preventDefault here.

               We only stop propagation so Gmail/
               workspace drag handlers cannot steal
               the interaction.
            */

            event.stopPropagation();

        },
        true
    );


    /* =====================================================
       NAVIGATION
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".mn-settings-nav-item"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const section =
                button.dataset.section;


            if (!section) {
                return;
            }


            switchSettingsSection(
                section
            );

        },
        true
    );


    /* =====================================================
       THEME
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            const card =
                event.target.closest(
                    ".mn-theme-card"
                );


            if (!card) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const theme =
                card.dataset.theme;


            if (!theme) {
                return;
            }


            /*
               Immediately update visual state.
            */

            overlay
                .querySelectorAll(
                    ".mn-theme-card"
                )
                .forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item === card
                        );

                    }
                );


            /*
               Save + apply setting.
            */

            updateMailnovaSetting(
                "theme",
                theme
            );

        },
        true
    );


    /* =====================================================
       TOGGLES
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".mn-setting-switch"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const key =
                button.dataset.setting;


            if (!key) {
                return;
            }


            const current =
                Boolean(
                    mailnovaSettings[key]
                );


            const newValue =
                !current;


            /*
               Immediate visual response.
            */

            button.classList.toggle(
                "active",
                newValue
            );


            button.setAttribute(
                "aria-pressed",
                String(newValue)
            );


            /*
               Save setting.
            */

            updateMailnovaSetting(
                key,
                newValue
            );

        },
        true
    );


    /* =====================================================
       PRIORITY FOCUS
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".mn-priority-focus-option"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const value =
                button.dataset.priorityFocus;


            if (!value) {
                return;
            }


            overlay
                .querySelectorAll(
                    ".mn-priority-focus-option"
                )
                .forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    }
                );


            updateMailnovaSetting(
                "priorityFocus",
                value
            );

        },
        true
    );


    /* =====================================================
       EMAIL LOADING
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".mn-loading-option"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const value =
                button.dataset.loading;


            if (!value) {
                return;
            }


            overlay
                .querySelectorAll(
                    ".mn-loading-option"
                )
                .forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    }
                );


            updateMailnovaSetting(
                "emailLoading",
                value
            );


            updateLoadingHint(
                value
            );

        },
        true
    );


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    const closeButton =
        document.getElementById(
            "mn-settings-modal-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                closeMailnovaSettings();

            },
            true
        );

    }


    /* =====================================================
       OUTSIDE CLICK
    ===================================================== */

    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                closeMailnovaSettings();

            }

        }
    );


    /* =====================================================
       INITIAL UI
    ===================================================== */

    updateSettingsUI();

}


/* =========================================================
   SECTION SWITCH
========================================================= */

function switchSettingsSection(
    section
) {

    document
        .querySelectorAll(
            ".mn-settings-nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    section
                );

            }
        );


    document
        .querySelectorAll(
            ".mn-settings-section-content"
        )
        .forEach(
            content => {

                content.classList.toggle(
                    "active",
                    content.dataset.content ===
                    section
                );

            }
        );


    const titles = {

        appearance: [
            "Appearance",
            "Choose how MailNova looks and feels."
        ],

        email: [
            "Email Preferences",
            "Control how MailNova handles your inbox."
        ],

        ai: [
            "AI Intelligence",
            "Manage MailNova AI features."
        ],

        loading: [
            "Email Loading",
            "Choose how MailNova loads your inbox."
        ],

        notifications: [
            "Notifications",
            "Control MailNova notifications."
        ]

    };


    const data =
        titles[section];


    if (!data) {

        return;

    }


    const title =
        document.getElementById(
            "mn-settings-section-title"
        );


    const description =
        document.getElementById(
            "mn-settings-section-description"
        );


    if (title) {

        title.textContent =
            data[0];

    }


    if (description) {

        description.textContent =
            data[1];

    }

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateSettingsUI() {

    const overlay =
        document.getElementById(
            "mailnova-settings-overlay"
        );


    if (!overlay) {

        return;

    }


    /* =====================================
       THEME
    ===================================== */

    overlay
        .querySelectorAll(
            ".mn-theme-card"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "active",

                    card.dataset.theme ===
                    mailnovaSettings.theme

                );

            }
        );


    /* =====================================
       TOGGLES
    ===================================== */

    overlay
        .querySelectorAll(
            ".mn-setting-switch"
        )
        .forEach(
            button => {

                const key =
                    button.dataset.setting;


                const active =
                    Boolean(
                        mailnovaSettings[key]
                    );


                button.classList.toggle(
                    "active",
                    active
                );


                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );

            }
        );


    /* =====================================
       PRIORITY FOCUS
    ===================================== */

    overlay
        .querySelectorAll(
            ".mn-priority-focus-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    button.dataset.priorityFocus ===
                    (
                        mailnovaSettings.priorityFocus ||
                        "unread"
                    )

                );

            }
        );


    /* =====================================
       LOADING
    ===================================== */

    overlay
        .querySelectorAll(
            ".mn-loading-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    button.dataset.loading ===
                    (
                        mailnovaSettings.emailLoading ||
                        "fast"
                    )

                );

            }
        );


    updateLoadingHint(
        mailnovaSettings.emailLoading
    );

}


/* =========================================================
   LOADING HINT
========================================================= */

function updateLoadingHint(
    value
) {

    const hint =
        document.getElementById(
            "mn-loading-hint"
        );


    if (!hint) {

        return;

    }


    const messages = {

        fast:
            "First emails appear immediately. Older emails continue loading in the background.",

        balanced:
            "Emails load smoothly while keeping Gmail responsive.",

        complete:
            "MailNova continues loading all available Gmail pages."

    };


    hint.textContent =
        messages[value] ||
        messages.fast;

}


/* =========================================================
   OPEN
========================================================= */

async function openMailnovaSettings(
    event
) {

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }


    await loadMailnovaSettings();


    let overlay =
        document.getElementById(
            "mailnova-settings-overlay"
        );


    if (!overlay) {

        createMailnovaSettingsModal();


        overlay =
            document.getElementById(
                "mailnova-settings-overlay"
            );

    }


    if (!overlay) {

        return;

    }


    updateSettingsUI();


    applyMailnovaTheme(
        mailnovaSettings.theme
    );


    applyMailnovaAppearanceSettings();


    applyMailnovaNotificationSettings();


    if (
        typeof setMailnovaPriorityFocus ===
        "function"
    ) {

        setMailnovaPriorityFocus(
            mailnovaSettings.priorityFocus ||
            "unread"
        );

    }


    requestAnimationFrame(
        () => {

            overlay.classList.add(
                "open"
            );

        }
    );

}


/* =========================================================
   CLOSE
========================================================= */

function closeMailnovaSettings() {

    const overlay =
        document.getElementById(
            "mailnova-settings-overlay"
        );


    if (!overlay) {

        return;

    }


    overlay.classList.remove(
        "open"
    );

}


/* =========================================================
   ESC
========================================================= */

if (
    !window.__mailnovaSettingsEscape
) {

    window.__mailnovaSettingsEscape =
        true;


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            const overlay =
                document.getElementById(
                    "mailnova-settings-overlay"
                );


            if (
                overlay &&
                overlay.classList.contains(
                    "open"
                )
            ) {

                closeMailnovaSettings();

            }

        }
    );

}


/* =========================================================
   SYSTEM THEME
========================================================= */

if (
    !window.__mailnovaSystemThemeListener
) {

    window.__mailnovaSystemThemeListener =
        true;


    const media =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    const handleThemeChange =
        () => {

            if (
                mailnovaSettings.theme ===
                "system"
            ) {

                applyMailnovaTheme(
                    "system"
                );

            }

        };


    if (
        typeof media.addEventListener ===
        "function"
    ) {

        media.addEventListener(
            "change",
            handleThemeChange
        );

    }

    else if (
        typeof media.addListener ===
        "function"
    ) {

        media.addListener(
            handleThemeChange
        );

    }

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadMailnovaSettings()
    .then(
        () => {

            applyMailnovaTheme(
                mailnovaSettings.theme
            );


            applyMailnovaAppearanceSettings();


            applyMailnovaNotificationSettings();


            if (
                typeof setMailnovaPriorityFocus ===
                "function"
            ) {

                setMailnovaPriorityFocus(
                    mailnovaSettings.priorityFocus ||
                    "unread"
                );

            }

        }
    );
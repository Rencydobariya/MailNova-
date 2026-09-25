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


/* =========================================================
   PROFESSIONAL SETTINGS ICONS
   Inline SVG keeps the UI sharp and consistent.
========================================================= */

const MN_SETTINGS_ICONS = {

    settings: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.7 3.7h4.6l.6 2.1c.5.2 1 .4 1.4.8l2.1-.6 2.3 4-1.6 1.5c.1.5.1 1.1 0 1.6l1.6 1.5-2.3 4-2.1-.6c-.4.3-.9.6-1.4.8l-.6 2.1H9.7l-.6-2.1c-.5-.2-1-.4-1.4-.8l-2.1.6-2.3-4 1.6-1.5a6.5 6.5 0 0 1 0-1.6L3.3 10l2.3-4 2.1.6c.4-.3.9-.6 1.4-.8l.6-2.1Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `,

    appearance: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2"></circle>
            <path d="M12 2.7v2.1M12 19.2v2.1M21.3 12h-2.1M4.8 12H2.7M18.58 5.42l-1.49 1.49M6.91 17.09l-1.49 1.49M18.58 18.58l-1.49-1.49M6.91 6.91 5.42 5.42"></path>
        </svg>
    `,

    email: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2.2"></rect>
            <path d="m4.2 7 7.8 6 7.8-6"></path>
        </svg>
    `,

    ai: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="6.5" width="14" height="12" rx="3"></rect>
            <path d="M9 6.5V4.5M15 6.5V4.5M12 2.8v1.7"></path>
            <circle cx="9.5" cy="12" r="1"></circle>
            <circle cx="14.5" cy="12" r="1"></circle>
            <path d="M9.5 15.5h5"></path>
            <path d="M5 11H3.5M20.5 11H19"></path>
        </svg>
    `,

    loading: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13.2 2.8 5.4 13h5.1l-.7 8.2L18.6 11h-5.1l-.3-8.2Z"></path>
        </svg>
    `,

    notifications: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 9.8a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.2h17C20.5 16.8 18 16.8 18 9.8Z"></path>
            <path d="M9.8 21h4.4"></path>
        </svg>
    `,

    compact: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"></path>
        </svg>
    `,

    glass: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 7.5 9L12 21 4.5 12 12 3Z"></path>
            <path d="m8.3 12 3.7-4.5 3.7 4.5-3.7 4.5L8.3 12Z"></path>
        </svg>
    `,

    autoOpen: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 4h7v7"></path>
            <path d="m20 4-9 9"></path>
            <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"></path>
        </svg>
    `,

    unread: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8"></circle>
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle>
        </svg>
    `,

    category: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5h6M14 5.5h6M4 12h6M14 12h6M4 18.5h6M14 18.5h6"></path>
            <circle cx="12" cy="5.5" r="1.5"></circle>
            <circle cx="12" cy="12" r="1.5"></circle>
            <circle cx="12" cy="18.5" r="1.5"></circle>
        </svg>
    `,

    sync: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 7v4h-4"></path>
            <path d="M4 17v-4h4"></path>
            <path d="M18.2 11a6.5 6.5 0 0 0-11.1-3.8L5 9"></path>
            <path d="M5.8 13a6.5 6.5 0 0 0 11.1 3.8L19 15"></path>
        </svg>
    `,

    priority: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z"></path>
        </svg>
    `,

    aiSummary: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"></path>
            <path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"></path>
        </svg>
    `,

    askAI: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18.2 4 21l.7-3.8A7.5 7.5 0 0 1 4 13c0-4.1 3.6-7.5 8-7.5s8 3.4 8 7.5-3.6 7.5-8 7.5c-1.5 0-2.9-.4-4-1.1Z"></path>
            <path d="M9.2 12h.1M12 12h.1M14.8 12h.1"></path>
        </svg>
    `,

    reply: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 8 4 12l5 4"></path>
            <path d="M5 12h7.2c4.4 0 7 2 7.8 6-.1-5.4-2.8-9-8-9H9"></path>
        </svg>
    `,

    fast: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13.2 2.8 5.4 13h5.1l-.7 8.2L18.6 11h-5.1l-.3-8.2Z"></path>
        </svg>
    `,

    balanced: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8h16M4 12h16M4 16h16"></path>
            <circle cx="9" cy="8" r="1.6"></circle>
            <circle cx="15" cy="12" r="1.6"></circle>
            <circle cx="10" cy="16" r="1.6"></circle>
        </svg>
    `,

    complete: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            <path d="M8 8h8M8 12h8M8 16h5"></path>
        </svg>
    `,

    important: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z"></path>
        </svg>
    `,

    badge: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4.2a6.2 6.2 0 0 1 6.2 6.2v3.2l1.7 2.7H4.1l1.7-2.7v-3.2A6.2 6.2 0 0 1 12 4.2Z"></path>
            <path d="M10 19h4"></path>
        </svg>
    `,

    check: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4.2 4.2L19 6.5"></path>
        </svg>
    `,

    themeLight: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2"></circle>
            <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"></path>
        </svg>
    `,

    themeDark: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z"></path>
        </svg>
    `,

    themeSystem: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4" width="17" height="12.5" rx="2"></rect>
            <path d="M8 20h8M12 16.5V20"></path>
        </svg>
    `
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

/* =========================================================
   UPDATE SETTING — FAST UI FIRST
========================================================= */

async function updateMailnovaSetting(
    key,
    value
) {

    /* =====================================
       VALIDATE
    ===================================== */

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


    /* =====================================
       UPDATE LOCAL STATE IMMEDIATELY
    ===================================== */

    mailnovaSettings[key] =
        value;


    /* =====================================
       APPLY UI IMMEDIATELY
       
       IMPORTANT:
       UI must NOT wait for storage.
    ===================================== */

    applyMailnovaSetting(
        key,
        value
    );


    /* =====================================
       DISPATCH IMMEDIATELY
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
       UPDATE SETTINGS UI
    ===================================== */

    updateSettingsUI();

    showSettingsSaved();


    /* =====================================
       SAVE IN BACKGROUND
       
       DO NOT BLOCK UI
    ===================================== */

    try {

        await saveMailnovaSettings();

    }

    catch (error) {

        console.error(
            "MailNova: Background settings save failed:",
            error
        );

    }

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
/* =========================================================
   FAST + SMOOTH THEME ENGINE
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


    const newThemeClass =
        effectiveTheme === "dark"
            ? "mailnova-theme-dark"
            : "mailnova-theme-light";


    const oldThemeClass =
        effectiveTheme === "dark"
            ? "mailnova-theme-light"
            : "mailnova-theme-dark";


    /*
     * Already on requested theme.
     * Do nothing.
     */

    if (
        workspace.classList.contains(
            newThemeClass
        )
    ) {

        return;

    }


    /*
     * Mark theme switch as active.
     */

    workspace.classList.add(
        "mailnova-theme-switching"
    );


    /*
     * Remove old theme.
     */

    workspace.classList.remove(
        oldThemeClass
    );


    /*
     * Add new theme immediately.
     */

    workspace.classList.add(
        newThemeClass
    );


    /*
     * Let browser paint the new theme first,
     * then remove transition state.
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    workspace.classList.remove(
                        "mailnova-theme-switching"
                    );

                }
            );

        }
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
                        ${MN_SETTINGS_ICONS.settings}
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

                        <span class="mn-nav-icon">${MN_SETTINGS_ICONS.appearance}</span>

                        <span>
                            Appearance
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="email"
                    >

                        <span class="mn-nav-icon">${MN_SETTINGS_ICONS.email}</span>

                        <span>
                            Email Preferences
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="ai"
                    >

                        <span class="mn-nav-icon">${MN_SETTINGS_ICONS.ai}</span>

                        <span>
                            AI Intelligence
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="loading"
                    >

                        <span class="mn-nav-icon">${MN_SETTINGS_ICONS.loading}</span>

                        <span>
                            Email Loading
                        </span>

                    </button>


                    <button
                        class="mn-settings-nav-item"
                        data-section="notifications"
                    >

                        <span class="mn-nav-icon">${MN_SETTINGS_ICONS.notifications}</span>

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

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.appearance}</span>

                        Theme

                    </div>

                    <div class="mn-content-subheading">
                        Choose your preferred theme
                    </div>


                    <div class="mn-theme-grid">

                        ${createThemeCard(
                            "light",
                            MN_SETTINGS_ICONS.themeLight,
                            "Light",
                            "Clean & bright"
                        )}

                        ${createThemeCard(
                            "dark",
                            MN_SETTINGS_ICONS.themeDark,
                            "Dark",
                            "Easy on eyes"
                        )}

                        ${createThemeCard(
                            "system",
                            MN_SETTINGS_ICONS.themeSystem,
                            "System",
                            "Follow device"
                        )}

                    </div>


                    <div class="mn-divider"></div>


                    ${createSettingRow(
                        "compactMode",
                        MN_SETTINGS_ICONS.compact,
                        "Compact Mode",
                        "Reduce spacing for more content."
                    )}


                    ${createSettingRow(
                        "glassEffect",
                        MN_SETTINGS_ICONS.glass,
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

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.email}</span>

                        Email Behavior

                    </div>

                    <div class="mn-content-subheading">
                        Control how MailNova handles your inbox.
                    </div>


                    ${createSettingRow(
                        "autoOpenWorkspace",
                        MN_SETTINGS_ICONS.autoOpen,
                        "Auto Open Workspace",
                        "Open MailNova automatically with Gmail."
                    )}


                    ${createSettingRow(
                        "unreadNotifications",
                        MN_SETTINGS_ICONS.unread,
                        "Unread Notifications",
                        "Show notifications for unread emails."
                    )}


                    ${createSettingRow(
                        "categoryDetection",
                        MN_SETTINGS_ICONS.category,
                        "Category Detection",
                        "Automatically classify emails."
                    )}


                    ${createSettingRow(
                        "backgroundSync",
                        MN_SETTINGS_ICONS.sync,
                        "Background Sync",
                        "Keep inbox data updated."
                    )}


                    <div class="mn-divider"></div>


                    <div class="mn-content-heading">

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.priority}</span>

                        Priority Focus

                    </div>

                    <div class="mn-content-subheading">
                        Choose which emails should receive extra priority.
                    </div>


                    <div class="mn-priority-focus-grid">

                        ${createPriorityFocusOption(
                            "unread",
                            MN_SETTINGS_ICONS.unread,
                            "Unread First",
                            "Give unread emails a priority boost."
                        )}

                        ${createPriorityFocusOption(
                            "all",
                            MN_SETTINGS_ICONS.aiSummary,
                            "All Emails",
                            "Rank emails without a read/unread preference."
                        )}

                        ${createPriorityFocusOption(
                            "read",
                            MN_SETTINGS_ICONS.check,
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

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.ai}</span>

                        AI Features

                    </div>

                    <div class="mn-content-subheading">
                        Manage MailNova AI features.
                    </div>


                    ${createSettingRow(
                        "aiSummary",
                        MN_SETTINGS_ICONS.aiSummary,
                        "AI Email Summary",
                        "Generate intelligent email summaries."
                    )}

                    ${createSettingRow(
                        "askAI",
                        MN_SETTINGS_ICONS.askAI,
                        "Ask AI",
                        "Ask questions about your emails."
                    )}

                    ${createSettingRow(
                        "smartReply",
                        MN_SETTINGS_ICONS.reply,
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

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.loading}</span>

                        Loading Mode

                    </div>

                    <div class="mn-content-subheading">
                        Choose how MailNova loads your inbox.
                    </div>


                    <div class="mn-loading-grid">

                        ${createLoadingOption(
                            "fast",
                            MN_SETTINGS_ICONS.fast,
                            "Fast",
                            "First emails immediately."
                        )}

                        ${createLoadingOption(
                            "balanced",
                            MN_SETTINGS_ICONS.balanced,
                            "Balanced",
                            "Smooth background loading."
                        )}

                        ${createLoadingOption(
                            "complete",
                            MN_SETTINGS_ICONS.complete,
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

                        <span class="mn-content-heading-icon">${MN_SETTINGS_ICONS.notifications}</span>

                        Notification Settings

                    </div>

                    <div class="mn-content-subheading">
                        Control MailNova notifications.
                    </div>


                    ${createSettingRow(
                        "importantNotifications",
                        MN_SETTINGS_ICONS.important,
                        "Important Emails",
                        "Notify you about important emails."
                    )}

                    ${createSettingRow(
                        "notificationBadge",
                        MN_SETTINGS_ICONS.badge,
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
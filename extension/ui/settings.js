/* =========================================================
   MAILNOVA SETTINGS
   Professional Settings Modal
========================================================= */

const MAILNOVA_SETTINGS_KEY = "mailnova_settings";

const MAILNOVA_DEFAULT_SETTINGS = {

    theme: "light",

    autoOpenWorkspace: true,
    unreadNotifications: true,
    categoryDetection: true,
    backgroundSync: true,

    /* =====================================================
       PRIORITY
    ===================================================== */

    priorityFocus: "unread",

    aiSummary: true,
    askAI: true,
    smartReply: true,

    emailLoading: "fast",

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
            ...(result[MAILNOVA_SETTINGS_KEY] || {})
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

    }

    catch (error) {

        console.error(
            "MailNova Settings Save Error:",
            error
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

    mailnovaSettings[key] = value;

    await saveMailnovaSettings();

    applyMailnovaSetting(
        key,
        value
    );

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

    if (key === "theme") {

        applyMailnovaTheme(value);

    }

}

/* =====================================================
   PRIORITY FOCUS 
===================================================== */

if (key === "priorityFocus") {

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

/* =========================================================
   THEME
========================================================= */

function getMailnovaEffectiveTheme() {

    if (
        mailnovaSettings.theme === "system"
    ) {

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";

    }

    return mailnovaSettings.theme;

}


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

    element.classList.add("show");

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
        document.createElement("div");


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


                <!-- =================================================
                     APPEARANCE
                ================================================== -->

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


                <!-- =================================================
                     EMAIL PREFERENCES
                ================================================== -->

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


                    <!-- PRIORITY FOCUS -->

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


                <!-- =================================================
                     AI INTELLIGENCE
                ================================================== -->

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


                <!-- =================================================
                     EMAIL LOADING
                ================================================== -->

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


                <!-- =================================================
                     NOTIFICATIONS
                ================================================== -->

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

function setupMailnovaSettingsControls() {

    const overlay =
        document.getElementById(
            "mailnova-settings-overlay"
        );

    if (!overlay) {

        return;

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-settings-nav-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        switchSettingsSection(
                            button.dataset.section
                        );

                    }
                );

            }
        );


    /* =====================================================
       THEME
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-theme-card"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        updateMailnovaSetting(
                            "theme",
                            button.dataset.theme
                        );

                    }
                );

            }
        );


    /* =====================================================
       TOGGLES
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-setting-switch"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        const key =
                            button.dataset.setting;

                        const current =
                            Boolean(
                                mailnovaSettings[key]
                            );

                        updateMailnovaSetting(
                            key,
                            !current
                        );

                    }
                );

            }
        );


    /* =====================================================
       PRIORITY FOCUS
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-priority-focus-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        updateMailnovaSetting(
                            "priorityFocus",
                            button.dataset.priorityFocus
                        );

                    }
                );

            }
        );


    /* =====================================================
       LOADING
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-loading-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        updateMailnovaSetting(
                            "emailLoading",
                            button.dataset.loading
                        );

                    }
                );

            }
        );


    /* =====================================================
       CLOSE
    ===================================================== */

    const closeButton =
        document.getElementById(
            "mn-settings-modal-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeMailnovaSettings();

            }
        );

    }


    /* =====================================================
       OUTSIDE CLICK
    ===================================================== */

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {

                closeMailnovaSettings();

            }

        }
    );


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
                    item.dataset.section === section
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
                    content.dataset.content === section
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


    /* =====================================================
       THEME
    ===================================================== */

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


    /* =====================================================
       TOGGLES
    ===================================================== */

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


    /* =====================================================
       PRIORITY FOCUS
    ===================================================== */

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


    /* =====================================================
       LOADING
    ===================================================== */

    overlay
        .querySelectorAll(
            ".mn-loading-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    button.dataset.loading ===
                    mailnovaSettings.emailLoading
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


    /* =====================================================
       APPLY PRIORITY FOCUS
    ===================================================== */

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
                event.key !== "Escape"
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
        media.addEventListener
    ) {

        media.addEventListener(
            "change",
            handleThemeChange
        );

    }

    else {

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


            /* =============================================
               INITIAL PRIORITY FOCUS
            ============================================= */

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
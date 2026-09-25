/* =========================================
   MAILNOVA CONTENT INITIALIZATION
   SAFE AUTO-OPEN + LIVE SETTINGS
========================================= */

console.log("MailNova Initialized 🚀");


(function initializeMailNova() {

    /* =========================================
       PREVENT DUPLICATE INITIALIZATION
    ========================================= */

    if (window.__mailnovaAutoOpenStarted) {
        return;
    }

    window.__mailnovaAutoOpenStarted = true;


    let started = false;


    /* =========================================
       CHECK AUTO OPEN SETTING
    ========================================= */

    async function shouldAutoOpenWorkspace() {

        try {

            if (
                typeof loadMailnovaSettings ===
                "function"
            ) {

                await loadMailnovaSettings();

            }

        }

        catch (error) {

            console.warn(
                "MailNova: Settings could not be loaded. Using default behavior.",
                error
            );

        }


        if (
            typeof mailnovaSettings !==
            "undefined" &&
            mailnovaSettings
        ) {

            return (
                mailnovaSettings.autoOpenWorkspace !==
                false
            );

        }


        /*
         * Default behavior:
         * Auto Open ON
         */

        return true;

    }


    /* =========================================
       SAFE WORKSPACE OPEN
    ========================================= */

    async function openWorkspaceSafely() {

        /*
         * Already open
         */

        if (
            document.getElementById(
                "mailnova-workspace"
            )
        ) {

            console.log(
                "MailNova: Workspace already exists."
            );

            return;

        }


        /*
         * Prevent duplicate opening
         */

        if (started) {

            console.log(
                "MailNova: Workspace opening already started."
            );

            return;

        }


        /*
         * Check Auto Open setting
         */

        const shouldOpen =
            await shouldAutoOpenWorkspace();


        if (!shouldOpen) {

            console.log(
                "MailNova: Auto Open Workspace is disabled."
            );

            return;

        }


        /*
         * Check workspace function
         */

        if (
            typeof createWorkspace !==
            "function"
        ) {

            console.warn(
                "MailNova: createWorkspace() is not ready."
            );

            return;

        }


        started = true;


        console.log(
            "MailNova: Opening workspace during browser idle time..."
        );


        try {

            await Promise.resolve(
                createWorkspace()
            );


            console.log(
                "MailNova: Workspace opened successfully."
            );

        }

        catch (error) {

            /*
             * Allow another attempt if creation failed.
             */

            started = false;


            console.error(
                "MailNova: Workspace initialization failed:",
                error
            );

        }

    }


    /* =========================================
       SCHEDULE WORKSPACE OPEN
    ========================================= */

    function scheduleWorkspaceOpen() {

        /*
         * Give Gmail enough time to finish
         * its initial rendering.
         */

        const delay = 1800;


        setTimeout(
            () => {

                /*
                 * Prefer browser idle time.
                 * This keeps Gmail responsive.
                 */

                if (
                    typeof window.requestIdleCallback ===
                    "function"
                ) {

                    window.requestIdleCallback(
                        () => {

                            openWorkspaceSafely();

                        },
                        {
                            timeout: 2500
                        }
                    );

                }

                else {

                    openWorkspaceSafely();

                }

            },
            delay
        );

    }


    /* =========================================
       LIVE AUTO OPEN SETTING
    ========================================= */

    function handleAutoOpenSettingChange(
        value
    ) {

        console.log(
            "MailNova: Auto Open setting changed:",
            value
        );


        /*
         * If Auto Open is enabled:
         * open workspace immediately if it
         * does not already exist.
         */

        if (
            value === true
        ) {

            /*
             * Reset the startup guard so that
             * enabling the setting later can
             * open the workspace.
             */

            if (
                !document.getElementById(
                    "mailnova-workspace"
                )
            ) {

                started = false;

                openWorkspaceSafely();

            }

            return;

        }


        /*
         * If Auto Open is disabled:
         *
         * IMPORTANT:
         * Do NOT close an already-open workspace.
         *
         * This setting controls automatic opening,
         * not manual workspace closing.
         */

        console.log(
            "MailNova: Auto Open disabled. Existing workspace will remain open."
        );

    }


    /* =========================================
       SETTINGS EVENT LISTENER
    ========================================= */

    if (
        !window.__mailnovaContentSettingsBridge
    ) {

        window.__mailnovaContentSettingsBridge =
            true;


        window.addEventListener(
            "mailnova-setting-changed",
            (event) => {

                const detail =
                    event.detail || {};


                if (
                    detail.key ===
                    "autoOpenWorkspace"
                ) {

                    handleAutoOpenSettingChange(
                        detail.value
                    );

                }

            }
        );

    }


    /* =========================================
       INITIALIZE ONCE
    ========================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            scheduleWorkspaceOpen,
            {
                once: true
            }
        );

    }

    else {

        scheduleWorkspaceOpen();

    }

})();
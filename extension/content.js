/* =========================================
   MAILNOVA CONTENT INITIALIZATION
   SAFE AUTO-OPEN VERSION
========================================= */

console.log("MailNova Initialized 🚀");


(function initializeMailNova() {

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


        return true;

    }


    /* =========================================
       SAFE WORKSPACE OPEN
    ========================================= */

    async function openWorkspaceSafely() {

        if (started) {
            return;
        }


        started = true;


        /* =====================================
           ALREADY OPEN
        ===================================== */

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


        /* =====================================
           AUTO OPEN SETTING
        ===================================== */

        const shouldOpen =
            await shouldAutoOpenWorkspace();


        if (!shouldOpen) {

            console.log(
                "MailNova: Auto Open Workspace is disabled."
            );

            return;

        }


        /* =====================================
           CHECK WORKSPACE FUNCTION
        ===================================== */

        if (
            typeof createWorkspace !==
            "function"
        ) {

            console.warn(
                "MailNova: createWorkspace() is not ready."
            );

            return;

        }


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

            console.error(
                "MailNova: Workspace initialization failed:",
                error
            );

        }

    }


    /* =========================================
       WAIT FOR GMAIL TO SETTLE
    ========================================= */

    function scheduleWorkspaceOpen() {

        /*
           Give Gmail time to finish its initial
           rendering before MailNova starts.
        */

        const delay =
            1800;


        setTimeout(
            () => {

                /*
                   Prefer browser idle time so
                   Gmail gets priority.
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
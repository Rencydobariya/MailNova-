/* =========================================
   MAILNOVA CONTENT INITIALIZATION
========================================= */

console.log("MailNova Initialized 🚀");


(function initializeMailNova() {

    if (window.__mailnovaAutoOpenStarted) {

        return;

    }


    window.__mailnovaAutoOpenStarted = true;


    let attempts = 0;

    const maxAttempts = 20;


    function openWorkspaceAutomatically() {

        attempts++;


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
           WORKSPACE FUNCTION NOT READY YET
        ===================================== */

        if (
            typeof createWorkspace !==
            "function"
        ) {

            if (attempts < maxAttempts) {

                console.log(
                    "MailNova: Waiting for workspace code..."
                );


                setTimeout(
                    openWorkspaceAutomatically,
                    300
                );

            }

            else {

                console.error(
                    "MailNova: createWorkspace() was not available."
                );

            }

            return;

        }


        /* =====================================
           CREATE WORKSPACE
        ===================================== */

        console.log(
            "MailNova: Automatically opening workspace..."
        );


        Promise.resolve(
            createWorkspace()
        )
        .catch(
            (error) => {

                console.error(
                    "MailNova: Automatic workspace error:",
                    error
                );

            }
        );

    }


    /* =========================================
       START AFTER DOM IS READY
    ========================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                setTimeout(
                    openWorkspaceAutomatically,
                    500
                );

            },
            {
                once: true
            }
        );

    }

    else {

        setTimeout(
            openWorkspaceAutomatically,
            500
        );

    }


    /* =========================================
       EXTRA SAFETY FOR GMAIL SPA
    ========================================= */

    window.addEventListener(
        "load",
        () => {

            setTimeout(
                openWorkspaceAutomatically,
                800
            );

        },
        {
            once: true
        }
    );


})();
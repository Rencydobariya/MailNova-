/* =========================================
   MAILNOVA FLOATING BUTTON
   ULTRA SMOOTH DRAG + FAST CLICK
========================================= */

if (
    !document.getElementById(
        "mailnova-ai-button"
    )
) {

    const button =
        document.createElement("div");


    button.id =
        "mailnova-ai-button";


    /* =========================================
       BUTTON HTML
    ========================================= */

    button.innerHTML = `

        <div class="mailnova-logo-wrapper">

            <img
                src="${chrome.runtime.getURL(
                    "assets/icons/logo_1.png"
                )}"
                class="mailnova-logo"
                alt="MailNova"
                draggable="false"
            >

        </div>

    <div
    class="mailnova-badge"
    id="mailnova-floating-important-badge"
    aria-hidden="true">
</div>

    `;


    document.body.appendChild(
        button
    );

/* =========================================
   IMPORTANT UNREAD BADGE
   Floating button shows ONLY:
   IMPORTANT + UNREAD emails
========================================= */

function updateMailnovaFloatingImportantBadge() {

    const badge =
        document.getElementById(
            "mailnova-floating-important-badge"
        );


    if (!badge) {

        return;

    }


    /*
     * MailNova notification system already
     * calculates the exact important unread count.
     */

    let importantUnreadCount = 0;


    if (
        typeof getMailnovaNotificationCounts ===
        "function"
    ) {

        try {

            const counts =
                getMailnovaNotificationCounts();


            importantUnreadCount =
                Number(
                    counts?.importantUnreadCount ||
                    0
                );

        }

        catch (error) {

            console.warn(
                "MailNova: Could not read important unread count:",
                error
            );

            importantUnreadCount =
                0;

        }

    }

    /*
     * Fallback:
     * If notification function is not ready yet,
     * calculate directly from MailNova emails.
     */

    else if (
        Array.isArray(
            window.mailnovaEmails
        )
    ) {

        importantUnreadCount =
            window.mailnovaEmails.filter(
                (email) => {

                    return (
                        Boolean(
                            email?.unread
                        ) &&
                        Boolean(
                            email?.important
                        )
                    );

                }
            ).length;

    }


    /*
     * No important unread emails
     * → completely hide badge.
     */

    if (
        importantUnreadCount <= 0
    ) {

        badge.textContent =
            "";

        badge.style.display =
            "none";

        badge.setAttribute(
            "aria-hidden",
            "true"
        );

        badge.removeAttribute(
            "title"
        );

        return;

    }


    /*
     * More than 99 → show 99+
     */

    const displayCount =
        importantUnreadCount > 99
            ? "99+"
            : String(
                importantUnreadCount
            );


    badge.textContent =
        displayCount;


    badge.style.display =
        "flex";


    badge.setAttribute(
        "aria-hidden",
        "false"
    );


    badge.setAttribute(
        "title",
        `${importantUnreadCount} important unread email${
            importantUnreadCount === 1
                ? ""
                : "s"
        }`
    );

}


/* =========================================
   INITIAL BADGE UPDATE
========================================= */

setTimeout(
    function () {

        updateMailnovaFloatingImportantBadge();

    },
    1000
);


/* =========================================
   UPDATE WHEN MAILNOVA SETTINGS CHANGE
========================================= */

window.addEventListener(
    "mailnova-setting-changed",
    function () {

        setTimeout(
            function () {

                updateMailnovaFloatingImportantBadge();

            },
            50
        );

    }
);


/* =========================================
   KEEP BADGE IN SYNC WITH MAIL DATA
========================================= */

setInterval(
    function () {

        updateMailnovaFloatingImportantBadge();

    },
    2000
);

    /* =========================================
       WORKSPACE STATE
    ========================================= */

    let workspaceOpening =
        false;


    /* =========================================
       DRAG STATE
    ========================================= */

    let isDragging =
        false;

    let dragStarted =
        false;

    let startX =
        0;

    let startY =
        0;

    let startLeft =
        0;

    let startTop =
        0;

    let buttonWidth =
        0;

    let buttonHeight =
        0;

    let currentX =
        0;

    let currentY =
        0;

    let animationFrame =
        null;


    /* =========================================
       PREVENT IMAGE DRAG
    ========================================= */

    const logo =
        button.querySelector(
            ".mailnova-logo"
        );


    if (logo) {

        logo.addEventListener(
            "dragstart",
            function (event) {

                event.preventDefault();

            }
        );

    }




    /* =========================================
       START DRAG
    ========================================= */

    button.addEventListener(
        "mousedown",
        function (event) {

            /*
             * Only left mouse button.
             */

            if (
                event.button !== 0
            ) {

                return;

            }


            const rect =
                button.getBoundingClientRect();


            /*
             * Cache dimensions and position
             * ONLY ONCE.
             */

            buttonWidth =
                rect.width;

            buttonHeight =
                rect.height;


            startX =
                event.clientX;

            startY =
                event.clientY;


            startLeft =
                rect.left;

            startTop =
                rect.top;


            currentX =
                event.clientX;

            currentY =
                event.clientY;


            isDragging =
                true;

            dragStarted =
                false;


            /*
             * Convert position to left/top.
             */

            button.style.left =
                `${rect.left}px`;

            button.style.top =
                `${rect.top}px`;

            button.style.right =
                "auto";

            button.style.bottom =
                "auto";


            /*
             * No transition during drag.
             */

            button.style.transition =
                "none";


            /*
             * Prevent text selection.
             */

            document.body.style.userSelect =
                "none";


            event.preventDefault();

        },
        {
            passive: false
        }
    );


    /* =========================================
       DRAG MOVE
    ========================================= */

    document.addEventListener(
        "mousemove",
        function (event) {

            if (
                !isDragging
            ) {

                return;

            }


            currentX =
                event.clientX;

            currentY =
                event.clientY;


            /*
             * Start actual dragging after
             * tiny movement.
             */

            const distanceX =
                Math.abs(
                    currentX -
                    startX
                );


            const distanceY =
                Math.abs(
                    currentY -
                    startY
                );


            if (
                distanceX > 2 ||
                distanceY > 2
            ) {

                dragStarted =
                    true;

                button.dataset.dragging =
                    "true";

            }


            /*
             * Only one animation frame
             * at a time.
             */

            if (
                animationFrame !== null
            ) {

                return;

            }


            animationFrame =
                requestAnimationFrame(
                    updateButtonPosition
                );


            event.preventDefault();

        },
        {
            passive: false
        }
    );


    /* =========================================
       UPDATE BUTTON POSITION
    ========================================= */

    function updateButtonPosition() {

        animationFrame =
            null;


        if (
            !isDragging
        ) {

            return;

        }


        /*
         * Calculate movement from original
         * mouse position.
         */

        let left =
            startLeft +
            (
                currentX -
                startX
            );


        let top =
            startTop +
            (
                currentY -
                startY
            );


        /*
         * Keep button inside Gmail viewport.
         */

        const maxLeft =
            Math.max(
                0,
                window.innerWidth -
                buttonWidth
            );


        const maxTop =
            Math.max(
                0,
                window.innerHeight -
                buttonHeight
            );


        if (
            left < 0
        ) {

            left =
                0;

        }


        if (
            top < 0
        ) {

            top =
                0;

        }


        if (
            left > maxLeft
        ) {

            left =
                maxLeft;

        }


        if (
            top > maxTop
        ) {

            top =
                maxTop;

        }


        /*
         * Direct position update.
         *
         * No expensive DOM queries here.
         */

        button.style.left =
            `${left}px`;

        button.style.top =
            `${top}px`;

        button.style.right =
            "auto";

        button.style.bottom =
            "auto";

    }


    /* =========================================
       END DRAG
    ========================================= */

    document.addEventListener(
        "mouseup",
        function () {

            if (
                !isDragging
            ) {

                return;

            }


            /*
             * Finish any pending frame.
             */

            if (
                animationFrame !== null
            ) {

                cancelAnimationFrame(
                    animationFrame
                );

                animationFrame =
                    null;

            }


            /*
             * Apply final position.
             */

            if (
                dragStarted
            ) {

                updateButtonPosition();

            }


            isDragging =
                false;


            /*
             * Restore normal page behavior.
             */

            document.body.style.userSelect =
                "";


            /*
             * Restore transition.
             */

            button.style.transition =
                "";


            /*
             * Save position ONLY after
             * dragging has finished.
             */

            if (
                dragStarted
            ) {


                /*
                 * Prevent the click event that
                 * follows mouseup from opening
                 * MailNova.
                 */

                button.dataset.dragging =
                    "true";


                setTimeout(
                    function () {

                        button.dataset.dragging =
                            "false";

                    },
                    100
                );

            }
            else {

                button.dataset.dragging =
                    "false";

            }

        }
    );


    /* =========================================
       CLICK
    ========================================= */

    button.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            /*
             * If the button was dragged,
             * don't open workspace.
             */

            if (
                button.dataset.dragging ===
                "true"
            ) {

                button.dataset.dragging =
                    "false";

                return;

            }


            /*
             * Prevent duplicate workspace
             * opening.
             */

            if (
                workspaceOpening
            ) {

                console.log(
                    "MailNova: Workspace is already opening..."
                );

                return;

            }


            /* =====================================
               OPEN NEW WORKSPACE
            ===================================== */

            if (
                !workspace
            ) {

                workspaceOpening =
                    true;


                console.log(
                    "MailNova: Opening workspace..."
                );


                try {

                    await createWorkspace();

                }

                catch (error) {

                    console.error(
                        "MailNova: Workspace opening failed:",
                        error
                    );

                }

                finally {

                    workspaceOpening =
                        false;

                }

            }


            /* =====================================
               RESTORE EXISTING WORKSPACE
            ===================================== */

            else {

                if (
                    typeof restoreWorkspace ===
                    "function"
                ) {

                    restoreWorkspace();

                }

            }

        }
    );


    /* =========================================
       WINDOW RESIZE
    ========================================= */

    window.addEventListener(
        "resize",
        function () {

            if (
                isDragging
            ) {

                return;

            }


            const rect =
                button.getBoundingClientRect();


            const maxLeft =
                Math.max(
                    0,
                    window.innerWidth -
                    rect.width
                );


            const maxTop =
                Math.max(
                    0,
                    window.innerHeight -
                    rect.height
                );


            let left =
                rect.left;

            let top =
                rect.top;


            if (
                left < 0
            ) {

                left =
                    0;

            }


            if (
                top < 0
            ) {

                top =
                    0;

            }


            if (
                left > maxLeft
            ) {

                left =
                    maxLeft;

            }


            if (
                top > maxTop
            ) {

                top =
                    maxTop;

            }


            button.style.left =
                `${left}px`;

            button.style.top =
                `${top}px`;

            button.style.right =
                "auto";

            button.style.bottom =
                "auto";

        },
        {
            passive: true
        }
    );


    /* =========================================
       ENABLE FALLBACK DRAG SYSTEM
       
       Only if makeDraggable exists.
       
       IMPORTANT:
       We DO NOT call it because this
       floating button already has its own
       optimized drag handler above.
    ========================================= */


    console.log(
        "MailNova Floating Button Loaded 🚀"
    );

    console.log(
        "MailNova: Fast floating button drag enabled ⚡"
    );

}
/* =========================================
   MAILNOVA ULTRA SMOOTH DRAG
   Low Latency / GPU Based Movement
========================================= */

function makeDraggable(element) {

    if (!element) {
        return;
    }

    if (
        element.dataset.mailnovaDragReady === "true"
    ) {
        return;
    }

    element.dataset.mailnovaDragReady = "true";


    /* =========================================
       STATE
    ========================================= */

    let dragging = false;

    let moved = false;

    let startMouseX = 0;
    let startMouseY = 0;

    let startLeft = 0;
    let startTop = 0;

    let buttonWidth = 0;
    let buttonHeight = 0;

    let currentMouseX = 0;
    let currentMouseY = 0;

    let frame = null;


    /* =========================================
       START DRAG
    ========================================= */

    function startDrag(event) {

        /*
         * Only left mouse button.
         */

        if (
            event.type === "mousedown" &&
            event.button !== 0
        ) {
            return;
        }


        const rect =
            element.getBoundingClientRect();


        /*
         * Read layout ONLY ONCE.
         */

        startMouseX =
            event.clientX;

        startMouseY =
            event.clientY;


        startLeft =
            rect.left;

        startTop =
            rect.top;


        buttonWidth =
            rect.width;

        buttonHeight =
            rect.height;


        currentMouseX =
            event.clientX;

        currentMouseY =
            event.clientY;


        dragging = true;

        moved = false;


        /*
         * Convert current position to
         * left/top positioning.
         */

        element.style.left =
            `${rect.left}px`;

        element.style.top =
            `${rect.top}px`;

        element.style.right =
            "auto";

        element.style.bottom =
            "auto";


        /*
         * Remove transition while dragging.
         */

        element.style.transition =
            "none";


        /*
         * Disable browser drag/select behavior.
         */

        document.body.style.userSelect =
            "none";


        /*
         * Tell floating-button.js that
         * a drag has started.
         */

        element.dataset.dragging =
            "false";


        event.preventDefault();

    }


    /* =========================================
       MOUSE MOVE
    ========================================= */

    function moveDrag(event) {

        if (!dragging) {
            return;
        }


        currentMouseX =
            event.clientX;

        currentMouseY =
            event.clientY;


        /*
         * Detect actual movement.
         */

        const distanceX =
            Math.abs(
                currentMouseX -
                startMouseX
            );


        const distanceY =
            Math.abs(
                currentMouseY -
                startMouseY
            );


        if (
            distanceX > 2 ||
            distanceY > 2
        ) {

            moved = true;

            element.dataset.dragging =
                "true";

        }


        /*
         * Don't create multiple animation
         * frames for the same movement.
         */

        if (
            frame !== null
        ) {
            return;
        }


        frame =
            requestAnimationFrame(
                updatePosition
            );


        event.preventDefault();

    }


    /* =========================================
       GPU POSITION UPDATE
    ========================================= */

    function updatePosition() {

        frame = null;


        if (!dragging) {
            return;
        }


        /*
         * Calculate movement from the
         * original mouse position.
         */

        let deltaX =
            currentMouseX -
            startMouseX;


        let deltaY =
            currentMouseY -
            startMouseY;


        /*
         * Calculate desired position.
         */

        let left =
            startLeft +
            deltaX;


        let top =
            startTop +
            deltaY;


        /*
         * Keep inside viewport.
         */

        const maxLeft =
            window.innerWidth -
            buttonWidth;


        const maxTop =
            window.innerHeight -
            buttonHeight;


        if (left < 0) {
            left = 0;
        }

        if (top < 0) {
            top = 0;
        }

        if (left > maxLeft) {
            left = maxLeft;
        }

        if (top > maxTop) {
            top = maxTop;
        }


        /*
         * IMPORTANT:
         *
         * transform is used during dragging.
         *
         * This avoids repeated layout
         * calculations and gives smooth
         * GPU accelerated movement.
         */

        const translateX =
            left - startLeft;


        const translateY =
            top - startTop;


        element.style.transform =
            `translate3d(${translateX}px, ${translateY}px, 0)`;

    }


    /* =========================================
       END DRAG
    ========================================= */

    function endDrag() {

        if (!dragging) {
            return;
        }


        /*
         * Make sure the latest mouse position
         * is rendered before finishing.
         */

        if (
            frame !== null
        ) {

            cancelAnimationFrame(
                frame
            );

            frame = null;

        }


        /*
         * Calculate final position.
         */

        let finalLeft =
            startLeft +
            (
                currentMouseX -
                startMouseX
            );


        let finalTop =
            startTop +
            (
                currentMouseY -
                startMouseY
            );


        const maxLeft =
            window.innerWidth -
            buttonWidth;


        const maxTop =
            window.innerHeight -
            buttonHeight;


        if (finalLeft < 0) {
            finalLeft = 0;
        }

        if (finalTop < 0) {
            finalTop = 0;
        }

        if (finalLeft > maxLeft) {
            finalLeft = maxLeft;
        }

        if (finalTop > maxTop) {
            finalTop = maxTop;
        }


        /*
         * Commit final position.
         */

        element.style.transform =
            "translate3d(0, 0, 0)";


        element.style.left =
            `${finalLeft}px`;

        element.style.top =
            `${finalTop}px`;


        element.style.right =
            "auto";

        element.style.bottom =
            "auto";


        /*
         * Restore transition.
         */

        element.style.transition =
            "";


        /*
         * Restore text selection.
         */

        document.body.style.userSelect =
            "";


        /*
         * Save only after dragging ends.
         */

        if (moved) {

            localStorage.setItem(
                "mailnova-position",
                JSON.stringify({

                    left:
                        `${finalLeft}px`,

                    top:
                        `${finalTop}px`

                })
            );

        }


        dragging = false;


        /*
         * Keep this true briefly so the
         * following click does not open
         * MailNova accidentally.
         */

        if (moved) {

            element.dataset.dragging =
                "true";


            setTimeout(
                () => {

                    element.dataset.dragging =
                        "false";

                },
                80
            );

        }
        else {

            element.dataset.dragging =
                "false";

        }

    }


    /* =========================================
       MOUSE EVENTS
    ========================================= */

    element.addEventListener(
        "mousedown",
        startDrag,
        {
            passive: false
        }
    );


    document.addEventListener(
        "mousemove",
        moveDrag,
        {
            passive: false
        }
    );


    document.addEventListener(
        "mouseup",
        endDrag,
        {
            passive: true
        }
    );


    /* =========================================
       TOUCH / TRACKPAD SUPPORT
    ========================================= */

    element.addEventListener(
        "touchstart",
        function (event) {

            const touch =
                event.touches[0];

            if (!touch) {
                return;
            }


            startDrag({

                clientX:
                    touch.clientX,

                clientY:
                    touch.clientY,

                preventDefault:
                    () => event.preventDefault(),

                type:
                    "touchstart"

            });

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchmove",
        function (event) {

            if (!dragging) {
                return;
            }


            const touch =
                event.touches[0];

            if (!touch) {
                return;
            }


            moveDrag({

                clientX:
                    touch.clientX,

                clientY:
                    touch.clientY,

                preventDefault:
                    () => event.preventDefault()

            });

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchend",
        endDrag,
        {
            passive: true
        }
    );


    /* =========================================
       VIEWPORT RESIZE
    ========================================= */

    window.addEventListener(
        "resize",
        function () {

            if (dragging) {
                return;
            }


            const rect =
                element.getBoundingClientRect();


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


            if (left > maxLeft) {
                left = maxLeft;
            }

            if (top > maxTop) {
                top = maxTop;
            }

            if (left < 0) {
                left = 0;
            }

            if (top < 0) {
                top = 0;
            }


            element.style.transform =
                "translate3d(0, 0, 0)";


            element.style.left =
                `${left}px`;

            element.style.top =
                `${top}px`;

            element.style.right =
                "auto";

            element.style.bottom =
                "auto";

        },
        {
            passive: true
        }
    );


    console.log(
        "MailNova: Ultra-smooth drag enabled ⚡"
    );

}
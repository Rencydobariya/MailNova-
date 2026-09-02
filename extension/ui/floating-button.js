/* =========================================
   MAILNOVA FLOATING BUTTON
========================================= */

if (!document.getElementById("mailnova-ai-button")) {

    const button =
        document.createElement("div");

    button.id =
        "mailnova-ai-button";


    button.innerHTML = `

        <div class="mailnova-logo-wrapper">

            <img
                src="${chrome.runtime.getURL(
                    "assets/icons/logo_1.png"
                )}"
                class="mailnova-logo"
                alt="MailNova"
            >

        </div>

        <div class="mailnova-badge">
            12
        </div>

    `;


    document.body.appendChild(button);


    /* =========================================
       DRAG STATE
    ========================================= */

    let isDragging = false;

    let mouseDownX = 0;

    let mouseDownY = 0;


    /*
       Prevent multiple workspace opening
       requests at the same time.
    */

    let workspaceOpening = false;


    /* =========================================
       MOUSE DOWN
    ========================================= */

    button.addEventListener(
        "mousedown",
        (event) => {

            isDragging = false;

            mouseDownX =
                event.clientX;

            mouseDownY =
                event.clientY;

        }
    );


    /* =========================================
       MOUSE MOVE
    ========================================= */

    button.addEventListener(
        "mousemove",
        (event) => {

            const distanceX =
                Math.abs(
                    event.clientX -
                    mouseDownX
                );

            const distanceY =
                Math.abs(
                    event.clientY -
                    mouseDownY
                );


            if (
                distanceX > 5 ||
                distanceY > 5
            ) {

                isDragging = true;

            }

        }
    );


    /* =========================================
       BUTTON CLICK
    ========================================= */

    button.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            event.stopPropagation();


            /*
               If the user dragged the button,
               don't open the workspace.
            */

            if (isDragging) {

                isDragging = false;

                return;

            }


            isDragging = false;


            /*
               Prevent duplicate workspace
               creation if user clicks rapidly.
            */

            if (workspaceOpening) {

                console.log(
                    "MailNova: Workspace is already opening..."
                );

                return;

            }


            /* =====================================
               OPEN WORKSPACE
            ===================================== */

            if (!workspace) {

                workspaceOpening = true;


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

                restoreWorkspace();

            }

        }
    );


    /* =========================================
       MAKE BUTTON DRAGGABLE
    ========================================= */

    makeDraggable(button);


    console.log(
        "MailNova Floating Button Loaded 🚀"
    );

}
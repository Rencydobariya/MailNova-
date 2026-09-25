/* =========================================================
   MAILNOVA ASK AI
   FINAL VERSION
   Dark/Light Theme + Fast + Movable + Cleanup
========================================================= */

let mailnovaAskAI = null;


/* =========================================================
   ASK AI THEME
========================================================= */

function applyMailnovaAskAITheme() {

    if (!mailnovaAskAI) {
        return;
    }


    const workspace =
        document.getElementById(
            "mailnova-workspace"
        );


    const isDark =
        workspace &&
        workspace.classList.contains(
            "mailnova-theme-dark"
        );


    mailnovaAskAI.classList.toggle(
        "mn-ai-dark",
        Boolean(isDark)
    );

}


/* =========================================================
   OPEN ASK AI
========================================================= */

function openAskAI(email) {

    /* =====================================
       CLOSE PREVIOUS WINDOW
    ===================================== */

    if (mailnovaAskAI) {

        closeAskAI();

    }


    /* =====================================
       CREATE WINDOW
    ===================================== */

    mailnovaAskAI =
        document.createElement(
            "div"
        );

    mailnovaAskAI.id =
        "mailnova-ask-ai";


    mailnovaAskAI.innerHTML = `

        <div class="mn-ai-header">

            <div class="mn-ai-title">

                <div class="mn-ai-icon">
                    🤖
                </div>

                <div>

                    <div class="mn-ai-name">
                        MailNova AI
                    </div>

                    <div class="mn-ai-status">
                        ● Ready
                    </div>

                </div>

            </div>


            <button
                type="button"
                class="mn-ai-close"
                id="mn-ai-close"
                aria-label="Close Ask AI"
            >
                ×
            </button>

        </div>


        <div class="mn-ai-email-context">

            <div class="mn-ai-context-label">
                ASK AI ABOUT
            </div>

            <div class="mn-ai-context-subject">
                ${escapeAIText(
                    email.subject ||
                    "No subject"
                )}
            </div>

            <div class="mn-ai-context-sender">
                ${escapeAIText(
                    email.sender ||
                    "Unknown sender"
                )}
            </div>

        </div>


        <div
            class="mn-ai-messages"
            id="mn-ai-messages"
        >

            <div class="mn-ai-message ai-message">

                <div class="mn-ai-avatar">
                    🤖
                </div>

                <div class="mn-ai-bubble">
                    Hi! I'm MailNova AI. Ask me anything about this email.
                </div>

            </div>

        </div>


        <div class="mn-ai-suggestions">

            <button
                type="button"
                class="mn-ai-suggestion"
            >
                What is this email about?
            </button>

            <button
                type="button"
                class="mn-ai-suggestion"
            >
                What action should I take?
            </button>

            <button
                type="button"
                class="mn-ai-suggestion"
            >
                Is this email important?
            </button>

        </div>


        <div class="mn-ai-input-area">

            <textarea
                id="mn-ai-input"
                placeholder="Ask something about this email..."
                rows="1"
            ></textarea>


            <button
                type="button"
                id="mn-ai-send"
                class="mn-ai-send"
                aria-label="Send"
            >
                ➤
            </button>

        </div>

    `;


    document.body.appendChild(
        mailnovaAskAI
    );


    /* =====================================
       APPLY CURRENT THEME IMMEDIATELY
    ===================================== */

    applyMailnovaAskAITheme();


    /* =====================================
       MAKE MOVABLE
    ===================================== */

    makeAskAIMovable(
        mailnovaAskAI
    );


    /* =====================================
       CLOSE BUTTON
    ===================================== */

    const closeButton =
        mailnovaAskAI.querySelector(
            "#mn-ai-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAskAI
        );

    }


    /* =====================================
       INPUT
    ===================================== */

    const input =
        mailnovaAskAI.querySelector(
            "#mn-ai-input"
        );


    const sendButton =
        mailnovaAskAI.querySelector(
            "#mn-ai-send"
        );


    /* =====================================
       SEND BUTTON
    ===================================== */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => {

                sendAIMessage(
                    email
                );

            }
        );

    }


    /* =====================================
       ENTER = SEND
    ===================================== */

    if (input) {

        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendAIMessage(
                        email
                    );

                }

            }
        );

    }


    /* =====================================
       SUGGESTIONS
    ===================================== */

    mailnovaAskAI
        .querySelectorAll(
            ".mn-ai-suggestion"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (!input) {
                            return;
                        }

                        input.value =
                            button.innerText;

                        sendAIMessage(
                            email
                        );

                    }
                );

            }
        );


    /* =====================================
       FOCUS
    ===================================== */

    if (input) {

        requestAnimationFrame(
            () => {

                input.focus();

            }
        );

    }

}


/* =========================================================
   SEND AI MESSAGE
========================================================= */

async function sendAIMessage(
    email
) {

    if (!mailnovaAskAI) {
        return;
    }


    const input =
        mailnovaAskAI.querySelector(
            "#mn-ai-input"
        );


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    /* =====================================
       USER MESSAGE
    ===================================== */

    addAIMessage(
        message,
        "user"
    );


    input.value = "";


    /* =====================================
       THINKING
    ===================================== */

    addAIMessage(
        "Thinking... 🤔",
        "ai"
    );


    try {

        const response =
            await fetch(
                "https://mailnova-9tzz.onrender.com/ask-ai",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            sender:
                                email.sender ||
                                "Unknown sender",

                            subject:
                                email.subject ||
                                "No subject",

                            body:
                                email.body ||
                                "",

                            question:
                                message

                        })

                }
            );


        const data =
            await response.json();


        /* =====================================
           REMOVE THINKING MESSAGE
        ===================================== */

        removeLastAIMessage();


        /* =====================================
           RESPONSE
        ===================================== */

        if (
            data &&
            data.success
        ) {

            addAIMessage(
                data.response,
                "ai"
            );

        }

        else {

            addAIMessage(
                "Sorry, I couldn't analyze this email.",
                "ai"
            );

        }

    }

    catch (error) {

        console.error(
            "MailNova Ask AI Error:",
            error
        );


        removeLastAIMessage();


        addAIMessage(
            "Unable to connect to MailNova AI backend. Please make sure the FastAPI server is running.",
            "ai"
        );

    }

}


/* =========================================================
   REMOVE LAST AI MESSAGE
========================================================= */

function removeLastAIMessage() {

    if (!mailnovaAskAI) {
        return;
    }


    const messages =
        mailnovaAskAI.querySelector(
            "#mn-ai-messages"
        );


    if (!messages) {
        return;
    }


    const aiMessages =
        messages.querySelectorAll(
            ".ai-message"
        );


    const lastAIMessage =
        aiMessages[
            aiMessages.length - 1
        ];


    if (lastAIMessage) {

        lastAIMessage.remove();

    }

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(
    text,
    type
) {

    if (!mailnovaAskAI) {
        return;
    }


    const messages =
        mailnovaAskAI.querySelector(
            "#mn-ai-messages"
        );


    if (!messages) {
        return;
    }


    if (
        type === "user"
    ) {

        messages.insertAdjacentHTML(
            "beforeend",
            `

            <div class="mn-ai-message user-message">

                <div class="mn-user-bubble">
                    ${escapeAIText(text)}
                </div>

            </div>

            `
        );

    }

    else {

        messages.insertAdjacentHTML(
            "beforeend",
            `

            <div class="mn-ai-message ai-message">

                <div class="mn-ai-avatar">
                    🤖
                </div>

                <div class="mn-ai-bubble">
                    ${escapeAIText(text)}
                </div>

            </div>

            `
        );

    }


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   CLOSE ASK AI
========================================================= */

function closeAskAI() {

    if (!mailnovaAskAI) {
        return;
    }


    /* =====================================
       CLEAN DRAG LISTENERS
    ===================================== */

    if (
        mailnovaAskAI.__askAIDragCleanup
    ) {

        mailnovaAskAI
            .__askAIDragCleanup();

    }


    /* =====================================
       REMOVE WINDOW
    ===================================== */

    mailnovaAskAI.remove();

    mailnovaAskAI =
        null;

}


/* =========================================================
   ESCAPE TEXT
========================================================= */

function escapeAIText(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   MAKE ASK AI MOVABLE
========================================================= */

function makeAskAIMovable(
    windowElement
) {

    const header =
        windowElement.querySelector(
            ".mn-ai-header"
        );


    if (!header) {
        return;
    }


    let isDragging =
        false;

    let startX =
        0;

    let startY =
        0;

    let startLeft =
        0;

    let startTop =
        0;


    header.style.cursor =
        "grab";


    /* =====================================
       MOUSE DOWN
    ===================================== */

    const handleMouseDown =
        (event) => {

            if (
                event.target.closest(
                    ".mn-ai-close"
                )
            ) {

                return;

            }


            isDragging =
                true;


            header.style.cursor =
                "grabbing";


            const rect =
                windowElement.getBoundingClientRect();


            startX =
                event.clientX;

            startY =
                event.clientY;


            startLeft =
                rect.left;

            startTop =
                rect.top;


            windowElement.style.position =
                "fixed";

            windowElement.style.left =
                startLeft + "px";

            windowElement.style.top =
                startTop + "px";

            windowElement.style.right =
                "auto";

            windowElement.style.bottom =
                "auto";


            event.preventDefault();

        };


    /* =====================================
       MOUSE MOVE
    ===================================== */

    const handleMouseMove =
        (event) => {

            if (!isDragging) {
                return;
            }


            let newLeft =
                startLeft +
                (
                    event.clientX -
                    startX
                );


            let newTop =
                startTop +
                (
                    event.clientY -
                    startY
                );


            const maxLeft =
                Math.max(
                    0,
                    window.innerWidth -
                    windowElement.offsetWidth
                );


            const maxTop =
                Math.max(
                    0,
                    window.innerHeight -
                    windowElement.offsetHeight
                );


            newLeft =
                Math.max(
                    0,
                    Math.min(
                        newLeft,
                        maxLeft
                    )
                );


            newTop =
                Math.max(
                    0,
                    Math.min(
                        newTop,
                        maxTop
                    )
                );


            windowElement.style.left =
                newLeft + "px";


            windowElement.style.top =
                newTop + "px";

        };


    /* =====================================
       MOUSE UP
    ===================================== */

    const handleMouseUp =
        () => {

            if (!isDragging) {
                return;
            }


            isDragging =
                false;


            header.style.cursor =
                "grab";

        };


    header.addEventListener(
        "mousedown",
        handleMouseDown
    );


    document.addEventListener(
        "mousemove",
        handleMouseMove
    );


    document.addEventListener(
        "mouseup",
        handleMouseUp
    );


    /* =====================================
       CLEANUP FUNCTION
       
       IMPORTANT:
       Prevents listeners accumulating
       every time Ask AI is opened.
    ===================================== */

    windowElement.__askAIDragCleanup =
        () => {

            header.removeEventListener(
                "mousedown",
                handleMouseDown
            );


            document.removeEventListener(
                "mousemove",
                handleMouseMove
            );


            document.removeEventListener(
                "mouseup",
                handleMouseUp
            );

        };

}


/* =========================================================
   LIVE THEME CHANGE
========================================================= */

if (
    !window.__mailnovaAskAIThemeListener
) {

    window.__mailnovaAskAIThemeListener =
        true;


    window.addEventListener(
        "mailnova-setting-changed",
        (event) => {

            const detail =
                event.detail || {};


            if (
                detail.key === "theme"
            ) {

                /*
                 * Wait one frame so workspace
                 * theme class is already updated.
                 */

                requestAnimationFrame(
                    () => {

                        applyMailnovaAskAITheme();

                    }
                );

            }

        }
    );

}


/* =========================================================
   SYSTEM THEME CHANGE
========================================================= */

if (
    !window.__mailnovaAskAISystemThemeListener
) {

    window.__mailnovaAskAISystemThemeListener =
        true;


    try {

        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        const handleSystemTheme =
            () => {

                applyMailnovaAskAITheme();

            };


        if (
            typeof mediaQuery.addEventListener ===
            "function"
        ) {

            mediaQuery.addEventListener(
                "change",
                handleSystemTheme
            );

        }

        else if (
            typeof mediaQuery.addListener ===
            "function"
        ) {

            mediaQuery.addListener(
                handleSystemTheme
            );

        }

    }

    catch (error) {

        console.warn(
            "MailNova: Ask AI system theme listener failed:",
            error
        );

    }

}
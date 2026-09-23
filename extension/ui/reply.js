/* =========================================
   MAILNOVA REPLY COMPOSER
========================================= */

function openReplyComposer(email) {

    /* =========================================
       REMOVE EXISTING COMPOSER
    ========================================= */

    const existing =
        document.getElementById(
            "mailnova-reply-composer"
        );


    if (existing) {

        existing.remove();

    }


    /* =========================================
       CREATE COMPOSER
    ========================================= */

    const composer =
        document.createElement("div");


    composer.id =
        "mailnova-reply-composer";


    composer.innerHTML = `

        <div class="mailnova-reply-header">

            <div class="mailnova-reply-title">

                ↩ Reply

            </div>


            <button
                class="mailnova-reply-close"
                id="mn-reply-close"
                type="button"
                aria-label="Close Reply"
            >

                ✕

            </button>

        </div>


        <div class="mailnova-reply-body">


            <!-- =================================
                 RECIPIENT
            ================================== -->

            <div class="mailnova-reply-field">

                <span class="mailnova-reply-label">

                    To:

                </span>


                <span
                    class="mailnova-reply-recipient"
                >

                    ${escapeReplyHTML(
                        email.sender ||
                        "Unknown sender"
                    )}

                </span>

            </div>


            <!-- =================================
                 AI SECTION
            ================================== -->

            <div class="mailnova-ai-reply-section">

                <div class="mailnova-ai-reply-title">

                    🤖 AI Suggested Reply

                </div>


                <textarea
                    id="mailnova-reply-text"
                    placeholder="Write your reply..."
                ></textarea>


                <!-- =================================
                     TONE
                ================================== -->

                <div class="mailnova-reply-controls">

                    <label
                        for="mailnova-reply-tone"
                    >

                        Tone:

                    </label>


                    <select
                        id="mailnova-reply-tone"
                    >

                        <option value="professional">
                            Professional
                        </option>


                        <option value="friendly">
                            Friendly
                        </option>


                        <option value="short">
                            Short & Simple
                        </option>


                        <option value="formal">
                            Formal
                        </option>


                        <option value="appreciative">
                            Appreciative
                        </option>

                    </select>


                    <button
                        id="mn-generate-reply"
                        class="mailnova-generate-reply"
                        type="button"
                    >

                        ✨ Generate

                    </button>

                </div>

            </div>


            <!-- =================================
                 ACTIONS
            ================================== -->

            <div class="mailnova-reply-actions">

                <button
                    id="mn-regenerate-reply"
                    class="mailnova-reply-secondary"
                    type="button"
                >

                    🔄 Regenerate

                </button>


                <button
                    id="mn-edit-reply"
                    class="mailnova-reply-secondary"
                    type="button"
                >

                    ✏ Edit

                </button>


                <button
                    id="mn-send-reply"
                    class="mailnova-send-reply"
                    type="button"
                >

                    ➤ Send Reply

                </button>


                <button
                    id="mn-cancel-reply"
                    class="mailnova-reply-cancel"
                    type="button"
                >

                    Cancel

                </button>

            </div>


        </div>

    `;


    document.body.appendChild(
        composer
    );


    /* =========================================
       STORE CURRENT EMAIL
    ========================================= */

    composer.dataset.emailId =
        email.id || "";


    composer.dataset.threadId =
        email.threadId || "";


    /* =========================================
       MAKE COMPOSER MOVABLE
    ========================================= */

    makeReplyComposerDraggable(
        composer
    );


    /* =========================================
       CLOSE
    ========================================= */

    const closeButton =
        document.getElementById(
            "mn-reply-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeReplyComposer
        );

    }


    const cancelButton =
        document.getElementById(
            "mn-cancel-reply"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeReplyComposer
        );

    }


    /* =========================================
       EDIT
    ========================================= */

    const editButton =
        document.getElementById(
            "mn-edit-reply"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                const textarea =
                    document.getElementById(
                        "mailnova-reply-text"
                    );


                if (!textarea) {

                    return;

                }


                textarea.focus();


                textarea.selectionStart =
                    textarea.value.length;


                textarea.selectionEnd =
                    textarea.value.length;

            }
        );

    }


    /* =========================================
       GENERATE
    ========================================= */

    const generateButton =
        document.getElementById(
            "mn-generate-reply"
        );


    if (generateButton) {

        generateButton.addEventListener(
            "click",
            () => {

                generateMailnovaReply(
                    email
                );

            }
        );

    }


    /* =========================================
       REGENERATE
    ========================================= */

    const regenerateButton =
        document.getElementById(
            "mn-regenerate-reply"
        );


    if (regenerateButton) {

        regenerateButton.addEventListener(
            "click",
            () => {

                generateMailnovaReply(
                    email
                );

            }
        );

    }


    /* =========================================
       SEND
    ========================================= */

    const sendButton =
        document.getElementById(
            "mn-send-reply"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => {

                sendMailnovaReply(
                    email
                );

            }
        );

    }


    /* =========================================
       OPEN ANIMATION
    ========================================= */

    requestAnimationFrame(
        () => {

            composer.classList.add(
                "show"
            );

        }
    );

}


/* =========================================
   MAKE REPLY COMPOSER DRAGGABLE
========================================= */

function makeReplyComposerDraggable(
    composer
) {

    if (!composer) {

        return;

    }


    const header =
        composer.querySelector(
            ".mailnova-reply-header"
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


    /* =====================================
       START DRAG
    ===================================== */

    header.addEventListener(
        "mousedown",
        (event) => {

            /*
               Do not start dragging when the
               user clicks the close button.
            */

            if (
                event.target.closest(
                    ".mailnova-reply-close"
                )
            ) {

                return;

            }


            const rect =
                composer.getBoundingClientRect();


            /*
               Convert centered/fixed position
               into exact screen coordinates.
            */

            composer.style.left =
                `${rect.left}px`;


            composer.style.top =
                `${rect.top}px`;


            composer.style.right =
                "auto";


            composer.style.bottom =
                "auto";


            composer.style.margin =
                "0";


            composer.style.transform =
                "none";


            startX =
                event.clientX;


            startY =
                event.clientY;


            startLeft =
                rect.left;


            startTop =
                rect.top;


            isDragging =
                true;


            composer.classList.add(
                "mailnova-reply-dragging"
            );


            document.body.classList.add(
                "mailnova-reply-is-dragging"
            );


            event.preventDefault();

            event.stopPropagation();

        }
    );


    /* =====================================
       MOVE
    ===================================== */

    document.addEventListener(
        "mousemove",
        (event) => {

            if (!isDragging) {

                return;

            }


            let left =
                startLeft +
                (
                    event.clientX -
                    startX
                );


            let top =
                startTop +
                (
                    event.clientY -
                    startY
                );


            const width =
                composer.offsetWidth;


            const height =
                composer.offsetHeight;


            const margin =
                8;


            const maxLeft =
                Math.max(
                    margin,
                    window.innerWidth -
                    width -
                    margin
                );


            const maxTop =
                Math.max(
                    margin,
                    window.innerHeight -
                    height -
                    margin
                );


            /*
               Keep composer inside viewport.
            */

            left =
                Math.max(
                    margin,
                    Math.min(
                        left,
                        maxLeft
                    )
                );


            top =
                Math.max(
                    margin,
                    Math.min(
                        top,
                        maxTop
                    )
                );


            composer.style.left =
                `${left}px`;


            composer.style.top =
                `${top}px`;

        }
    );


    /* =====================================
       END DRAG
    ===================================== */

    document.addEventListener(
        "mouseup",
        () => {

            if (!isDragging) {

                return;

            }


            isDragging =
                false;


            composer.classList.remove(
                "mailnova-reply-dragging"
            );


            document.body.classList.remove(
                "mailnova-reply-is-dragging"
            );

        }
    );

}


/* =========================================
   CLOSE COMPOSER
========================================= */

function closeReplyComposer() {

    const composer =
        document.getElementById(
            "mailnova-reply-composer"
        );


    if (!composer) {

        return;

    }


    composer.classList.remove(
        "show"
    );


    setTimeout(
        () => {

            /*
               Make sure the same composer was
               not recreated before removing it.
            */

            if (
                composer &&
                composer.parentNode
            ) {

                composer.remove();

            }

        },
        250
    );

}


/* =========================================
   GENERATE AI REPLY
========================================= */

async function generateMailnovaReply(
    email
) {

    const textarea =
        document.getElementById(
            "mailnova-reply-text"
        );


    const toneSelect =
        document.getElementById(
            "mailnova-reply-tone"
        );


    if (!textarea) {

        return;

    }


    const tone =
        toneSelect
            ? toneSelect.value
            : "professional";


    textarea.value =
        "✨ MailNova is generating your reply...";


    try {

        const response =
            await fetch(
                `${MAILNOVA_API}/generate-reply`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        sender:
                            email.sender ||
                            "",

                        subject:
                            email.subject ||
                            "",

                        body:
                            email.body ||
                            email.snippet ||
                            "",

                        tone

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Reply API failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Reply generation failed"
            );

        }


        textarea.value =
            data.reply ||
            "";


    }

    catch (error) {

        console.error(
            "MailNova Reply Error:",
            error
        );


        textarea.value =
            "Unable to generate reply. Please try again.";

    }

}


/* =========================================
   SEND REPLY
========================================= */

async function sendMailnovaReply(
    email
) {

    const textarea =
        document.getElementById(
            "mailnova-reply-text"
        );


    if (!textarea) {

        return;

    }


    const message =
        textarea.value.trim();


    if (!message) {

        alert(
            "Please write a reply first."
        );

        return;

    }


    if (!email.threadId) {

        alert(
            "Gmail thread ID is missing."
        );

        return;

    }


    const sendButton =
        document.getElementById(
            "mn-send-reply"
        );


    if (sendButton) {

        sendButton.disabled =
            true;


        sendButton.textContent =
            "⏳ Sending...";

    }


    try {

        const response =
            await fetch(
                `${MAILNOVA_API}/gmail/reply`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        thread_id:
                            email.threadId,

                        to:
                            email.sender,

                        subject:
                            email.subject ||
                            "",

                        body:
                            message

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Send reply failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Reply could not be sent."
            );

        }


        alert(
            "Reply sent successfully! ✓"
        );


        closeReplyComposer();


    }

    catch (error) {

        console.error(
            "MailNova Send Reply Error:",
            error
        );


        alert(
            "Reply could not be sent. Please try again."
        );


        if (sendButton) {

            sendButton.disabled =
                false;


            sendButton.textContent =
                "➤ Send Reply";

        }

    }

}


/* =========================================
   SAFE HTML
========================================= */

function escapeReplyHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
/* =========================================
   MAILNOVA REPLY COMPOSER
========================================= */

function openReplyComposer(email) {

    /* Remove existing composer */

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
                id="mn-reply-close">

                ✕

            </button>

        </div>


        <div class="mailnova-reply-body">


            <!-- Recipient -->

            <div class="mailnova-reply-field">

                <span class="mailnova-reply-label">
                    To:
                </span>

                <span
                    class="mailnova-reply-recipient">

                    ${escapeReplyHTML(
                        email.sender || "Unknown sender"
                    )}

                </span>

            </div>


            <!-- AI Section -->

            <div class="mailnova-ai-reply-section">

                <div class="mailnova-ai-reply-title">

                    🤖 AI Suggested Reply

                </div>


                <textarea
                    id="mailnova-reply-text"
                    placeholder="Write your reply..."
                ></textarea>


                <!-- Tone -->

                <div class="mailnova-reply-controls">

                    <label
                        for="mailnova-reply-tone">

                        Tone:

                    </label>


                    <select
                        id="mailnova-reply-tone">

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
                        class="mailnova-generate-reply">

                        ✨ Generate

                    </button>

                </div>

            </div>


            <!-- Actions -->

            <div class="mailnova-reply-actions">

                <button
                    id="mn-regenerate-reply"
                    class="mailnova-reply-secondary">

                    🔄 Regenerate

                </button>


                <button
                    id="mn-edit-reply"
                    class="mailnova-reply-secondary">

                    ✏ Edit

                </button>


                <button
                    id="mn-send-reply"
                    class="mailnova-send-reply">

                    ➤ Send Reply

                </button>


                <button
                    id="mn-cancel-reply"
                    class="mailnova-reply-cancel">

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
       CLOSE
    ========================================= */

    document
        .getElementById(
            "mn-reply-close"
        )
        .addEventListener(
            "click",
            closeReplyComposer
        );


    document
        .getElementById(
            "mn-cancel-reply"
        )
        .addEventListener(
            "click",
            closeReplyComposer
        );


    /* =========================================
       EDIT
    ========================================= */

    document
        .getElementById(
            "mn-edit-reply"
        )
        .addEventListener(
            "click",
            () => {

                const textarea =
                    document.getElementById(
                        "mailnova-reply-text"
                    );

                if (!textarea) return;

                textarea.focus();

                textarea.selectionStart =
                    textarea.value.length;

            }
        );


    /* =========================================
       GENERATE
    ========================================= */

    document
        .getElementById(
            "mn-generate-reply"
        )
        .addEventListener(
            "click",
            () => {

                generateMailnovaReply(
                    email
                );

            }
        );


    /* =========================================
       REGENERATE
    ========================================= */

    document
        .getElementById(
            "mn-regenerate-reply"
        )
        .addEventListener(
            "click",
            () => {

                generateMailnovaReply(
                    email
                );

            }
        );


    /* =========================================
       SEND
    ========================================= */

    document
        .getElementById(
            "mn-send-reply"
        )
        .addEventListener(
            "click",
            () => {

                sendMailnovaReply(
                    email
                );

            }
        );


    /* =========================================
       OPEN ANIMATION
    ========================================= */

    requestAnimationFrame(() => {

        composer.classList.add(
            "show"
        );

    });

}


/* =========================================
   CLOSE COMPOSER
========================================= */

function closeReplyComposer() {

    const composer =
        document.getElementById(
            "mailnova-reply-composer"
        );

    if (!composer) return;

    composer.classList.remove(
        "show"
    );

    setTimeout(() => {

        composer.remove();

    }, 250);

}


/* =========================================
   GENERATE AI REPLY
========================================= */

async function generateMailnovaReply(email) {

    const textarea =
        document.getElementById(
            "mailnova-reply-text"
        );

    const toneSelect =
        document.getElementById(
            "mailnova-reply-tone"
        );

    if (!textarea) return;


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
                            email.sender || "",

                        subject:
                            email.subject || "",

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
            data.reply || "";


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

async function sendMailnovaReply(email) {

    const textarea =
        document.getElementById(
            "mailnova-reply-text"
        );

    if (!textarea) return;


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

        sendButton.disabled = true;

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
                            email.subject || "",

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

            sendButton.disabled = false;

            sendButton.textContent =
                "➤ Send Reply";

        }

    }

}


/* =========================================
   SAFE HTML
========================================= */

function escapeReplyHTML(value) {

    return String(value || "")
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
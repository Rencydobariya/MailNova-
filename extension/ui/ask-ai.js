let mailnovaAskAI = null;

function openAskAI(email) {

    // Already open hai to close
    if (mailnovaAskAI) {
        mailnovaAskAI.remove();
    }

    mailnovaAskAI = document.createElement("div");
    mailnovaAskAI.id = "mailnova-ask-ai";

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
                class="mn-ai-close"
                id="mn-ai-close">
                ×
            </button>

        </div>


        <div class="mn-ai-email-context">

            <div class="mn-ai-context-label">
                ASK AI ABOUT
            </div>

            <div class="mn-ai-context-subject">
                ${escapeAIText(email.subject || "No subject")}
            </div>

            <div class="mn-ai-context-sender">
                ${escapeAIText(email.sender || "Unknown sender")}
            </div>

        </div>


        <div
            class="mn-ai-messages"
            id="mn-ai-messages">

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

            <button class="mn-ai-suggestion">
                What is this email about?
            </button>

            <button class="mn-ai-suggestion">
                What action should I take?
            </button>

            <button class="mn-ai-suggestion">
                Is this email important?
            </button>

        </div>


        <div class="mn-ai-input-area">

            <textarea
                id="mn-ai-input"
                placeholder="Ask something about this email..."
                rows="1">
            </textarea>

            <button
                id="mn-ai-send"
                class="mn-ai-send">
                ➤
            </button>

        </div>

    `;

    document.body.appendChild(mailnovaAskAI);
    // Make Ask AI window movable
    makeAskAIMovable(mailnovaAskAI);


    // Close button
    document
        .getElementById("mn-ai-close")
        .addEventListener("click", closeAskAI);


    const input =
        document.getElementById("mn-ai-input");

    const sendButton =
        document.getElementById("mn-ai-send");


    // Send button
    sendButton.addEventListener("click", () => {

        sendAIMessage(email);

    });


    // Enter = send
    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            sendAIMessage(email);

        }

    });


    // Suggested questions
    document
        .querySelectorAll(".mn-ai-suggestion")
        .forEach(button => {

            button.addEventListener("click", () => {

                input.value = button.innerText;

                sendAIMessage(email);

            });

        });


    input.focus();

}



async function sendAIMessage(email) {

    const input =
        document.getElementById("mn-ai-input");

    const message =
        input.value.trim();

    if (!message) return;

    // User ka message screen par show karo
    addAIMessage(message, "user");

    // Input clear karo
    input.value = "";

    // Temporary loading message
    addAIMessage("Thinking... 🤔", "ai");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/ask-ai",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

body: JSON.stringify({

    sender: email.sender || "Unknown sender",

    subject: email.subject || "No subject",

    body: email.body || "",

    question: message

})

            }
        );

        const data = await response.json();

        // Thinking message remove karo
        const messages =
            document.getElementById("mn-ai-messages");

        const aiMessages =
            messages.querySelectorAll(".ai-message");

        const lastAIMessage =
            aiMessages[aiMessages.length - 1];

        if (lastAIMessage) {
            lastAIMessage.remove();
        }

        // Backend ka actual Gemini response
        if (data.success) {

            addAIMessage(
                data.response,
                "ai"
            );

        } else {

            addAIMessage(
                "Sorry, I couldn't analyze this email.",
                "ai"
            );

        }

    } catch (error) {

        console.error(
            "MailNova Ask AI Error:",
            error
        );

        // Thinking message remove karo
        const messages =
            document.getElementById("mn-ai-messages");

        const aiMessages =
            messages.querySelectorAll(".ai-message");

        const lastAIMessage =
            aiMessages[aiMessages.length - 1];

        if (lastAIMessage) {
            lastAIMessage.remove();
        }

        addAIMessage(
            "Unable to connect to MailNova AI backend. Please make sure the FastAPI server is running.",
            "ai"
        );

    }

}

function addAIMessage(text, type) {

    const messages =
        document.getElementById("mn-ai-messages");

    if (!messages) return;


    if (type === "user") {

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


function closeAskAI() {

    if (mailnovaAskAI) {

        mailnovaAskAI.remove();

        mailnovaAskAI = null;

    }

}


function escapeAIText(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function makeAskAIMovable(windowElement) {

    const header = windowElement.querySelector(".mn-ai-header");

    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    header.style.cursor = "grab";

    header.addEventListener("mousedown", (event) => {

        // Close button par click ho to dragging start nahi hogi
        if (event.target.closest(".mn-ai-close")) {
            return;
        }

        isDragging = true;

        header.style.cursor = "grabbing";

        const rect = windowElement.getBoundingClientRect();

        startX = event.clientX;
        startY = event.clientY;

        startLeft = rect.left;
        startTop = rect.top;

        // Fixed positioning ensure karo
        windowElement.style.position = "fixed";
        windowElement.style.left = startLeft + "px";
        windowElement.style.top = startTop + "px";
        windowElement.style.right = "auto";
        windowElement.style.bottom = "auto";

        event.preventDefault();

    });


    document.addEventListener("mousemove", (event) => {

        if (!isDragging) return;

        let newLeft =
            startLeft + (event.clientX - startX);

        let newTop =
            startTop + (event.clientY - startY);


        // Screen ke bahar completely na jaaye
        const maxLeft =
            window.innerWidth - windowElement.offsetWidth;

        const maxTop =
            window.innerHeight - windowElement.offsetHeight;


        newLeft = Math.max(
            0,
            Math.min(newLeft, maxLeft)
        );

        newTop = Math.max(
            0,
            Math.min(newTop, maxTop)
        );


        windowElement.style.left =
            newLeft + "px";

        windowElement.style.top =
            newTop + "px";

    });


    document.addEventListener("mouseup", () => {

        if (!isDragging) return;

        isDragging = false;

        header.style.cursor = "grab";

    });

}
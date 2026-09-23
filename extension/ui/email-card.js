/* =========================================
   MAILNOVA EMAIL CARD
========================================= */

function createEmailCard(email) {

    const priority =
        getPriorityBadge(email);


    const isUnread =
        Boolean(email.unread);


    const readStatus =
        isUnread
            ? "UNREAD"
            : "READ";


    const readStatusClass =
        isUnread
            ? "mailnova-email-unread"
            : "mailnova-email-read";


    const statusActionLabel =
        isUnread
            ? "Mark as read"
            : "Mark as unread";


    /* =========================================
       MAILNOVA SETTINGS
    ========================================= */

    const settings =
        typeof mailnovaSettings !==
        "undefined"
            ? mailnovaSettings
            : {};


    const showAskAI =
        settings.askAI !== false;


    const showSmartReply =
        settings.smartReply !== false;


    const showAISummary =
        settings.aiSummary !== false;


    /* =========================================
       READ / UNREAD ICONS

       UNREAD:
       Open envelope → Mark as Read

       READ:
       Closed envelope → Mark as Unread
    ========================================= */

    const statusIcon =
        isUnread

            ? `
                <svg
                    class="mn-mark-read-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                >

                    <path
                        d="M3.5 7
                           A2 2 0 0 1 5.5 5
                           H18.5
                           A2 2 0 0 1 20.5 7
                           V17
                           A2 2 0 0 1 18.5 19
                           H5.5
                           A2 2 0 0 1 3.5 17
                           Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.65"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M4.5 7
                           L12 12.7
                           L19.5 7"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.65"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                </svg>
            `

            : `
                <svg
                    class="mn-mark-read-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                >

                    <rect
                        x="3.5"
                        y="5"
                        width="17"
                        height="14"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.65"
                    />

                    <path
                        d="M4.5 7
                           L12 12.5
                           L19.5 7"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.65"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                </svg>
            `;


    /* =========================================
       SUMMARY
    ========================================= */

    const summaryText =
        showAISummary

            ? (
                email.summary ||
                email.snippet ||
                "No preview available."
            )

            : (
                email.snippet ||
                "No preview available."
            );


    /* =========================================
       ASK AI BUTTON
    ========================================= */

    const askAIButton =
        showAskAI

            ? `
                <button
                    class="mn-ai mailnova-action-btn"
                    data-id="${email.id}"
                    type="button"
                    aria-label="Ask MailNova AI"
                >

                    <span
                        class="mn-action-icon"
                        aria-hidden="true"
                    >
                        🤖
                    </span>

                    <span>
                        Ask AI
                    </span>

                </button>
            `

            : "";


    /* =========================================
       REPLY BUTTON
    ========================================= */

    const replyButton =
        showSmartReply

            ? `
                <button
                    class="mn-reply mailnova-action-btn"
                    data-id="${email.id}"
                    type="button"
                    aria-label="Reply to email"
                >

                    <span
                        class="mn-action-icon"
                        aria-hidden="true"
                    >
                        ↩
                    </span>

                    <span>
                        Reply
                    </span>

                </button>
            `

            : "";


    /* =========================================
       RETURN EMAIL CARD
    ========================================= */

    return `

    <div
        class="mailnova-email-card ${readStatusClass}"
        data-id="${email.id}"
        data-thread-id="${email.threadId || ""}"
    >

        <!-- =====================================
             CARD HEADER
        ====================================== -->

        <div class="mailnova-card-header">

            <div class="mailnova-sender-wrapper">

                <span
                    class="mailnova-read-status-dot"
                    aria-hidden="true"
                ></span>


                <div class="mailnova-sender">

                    ${email.sender}

                </div>


                <button
                    class="mailnova-read-status"
                    data-id="${email.id}"
                    data-unread="${isUnread ? "true" : "false"}"
                    type="button"
                    aria-label="${statusActionLabel}"
                >

                    ${readStatus}

                </button>

            </div>


            <div class="mailnova-meta">

                <span
                    class="mailnova-priority ${priority.className}"
                >

                    ${priority.rating}

                </span>


                <span class="mailnova-date">

                    ${email.date}

                </span>

            </div>

        </div>


        <!-- =====================================
             SUBJECT
        ====================================== -->

        <div class="mailnova-subject">

            ${email.subject}

        </div>


        <!-- =====================================
             SUMMARY
        ====================================== -->

        <div class="mailnova-summary">

            ${summaryText}

        </div>


        <!-- =====================================
             ACTION BUTTONS
        ====================================== -->

        <div class="mailnova-card-actions">


            <!-- VIEW -->

            <button
                class="mn-view mailnova-action-btn"
                data-id="${email.id}"
                type="button"
                aria-label="View email"
            >

                <span
                    class="mn-action-icon"
                    aria-hidden="true"
                >
                    👁
                </span>

                <span>
                    View
                </span>

            </button>


            <!-- ASK AI -->

            ${askAIButton}


            <!-- SMART REPLY -->

            ${replyButton}


            <!-- =================================
                 READ / UNREAD

                 IMPORTANT:
                 Keep .mn-mark-read because
                 workspace.js uses this class
                 for the Gmail Read/Unread API.
            ================================== -->

            <button
                class="
                    mn-mark-read
                    mailnova-status-action
                "
                data-id="${email.id}"
                data-unread="${isUnread ? "true" : "false"}"
                data-status="${isUnread ? "unread" : "read"}"
                type="button"
                aria-label="${statusActionLabel}"
                title="${statusActionLabel}"
            >

                ${statusIcon}

            </button>


        </div>

    </div>

    `;

}
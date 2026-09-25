/* =========================================================
   MAILNOVA FRONTEND SPAM DETECTOR
   This is a FALLBACK detector.

   Backend spam detection can still work.
   This detector makes sure the UI can detect spam even
   when backend spam information is missing.
========================================================= */

function detectMailnovaSpam(email) {

    if (!email) {
        return false;
    }

    /* -----------------------------------------
       1. Backend / Gmail result
    ----------------------------------------- */

    if (
        email.spam === true ||
        email.spam === "true" ||
        email.aiSpam === true
    ) {
        return true;
    }


    /* -----------------------------------------
       2. Build searchable text
    ----------------------------------------- */

    const text = [
        email.sender || "",
        email.subject || "",
        email.snippet || "",
        email.body || "",
        email.summary || ""
    ]
        .join(" ")
        .toLowerCase();


    if (!text.trim()) {
        return false;
    }


    /* -----------------------------------------
       3. HIGH CONFIDENCE PATTERNS
    ----------------------------------------- */

    const highRiskPatterns = [

        /you\s+have\s+won/i,

        /you\s+won/i,

        /you'?re\s+a\s+winner/i,

        /claim\s+your\s+(prize|reward|bonus|cash|gift)/i,

        /(winner|congratulations).{0,150}(prize|reward|cash|gift|lottery|jackpot)/i,

        /verify\s+your\s+(account|password|identity|email|payment|billing)/i,

        /confirm\s+your\s+(account|identity|email|payment|billing)/i,

        /(account|email|payment|billing).{0,50}(suspended|locked|blocked|disabled)/i,

        /(urgent|immediately|action\s+required).{0,150}(verify|confirm|login|click|update|password)/i,

        /(click|tap)\s+(here|the\s+link).{0,150}(claim|verify|confirm|reward|prize|gift|login)/i,

        /free\s+(money|cash)/i,

        /cash\s+prize/i,

        /(double|triple)\s+your\s+money/i,

        /guaranteed\s+(income|profit|returns?)/i,

        /(crypto|bitcoin)\s+giveaway/i,

        /(security\s+alert|security\s+warning).{0,150}(verify|confirm|login|update|click)/i,

        /password\s+(expires|expired).{0,150}(login|verify|update|confirm)/i,

        /(refund|payment)\s+(failed|pending|blocked).{0,150}(click|verify|confirm|update)/i
    ];


    for (const pattern of highRiskPatterns) {

        if (pattern.test(text)) {

            console.warn(
                "MailNova: SPAM DETECTED 🚨",
                {
                    id: email.id,
                    sender: email.sender,
                    subject: email.subject,
                    reason: "High-risk spam pattern"
                }
            );

            return true;
        }
    }


    /* -----------------------------------------
       4. Suspicious phrases
    ----------------------------------------- */

    const suspiciousTerms = [

        "claim your reward",
        "claim your prize",
        "free money",
        "free cash",
        "cash prize",
        "double your money",
        "guaranteed income",
        "guaranteed profit",
        "crypto giveaway",
        "gift card winner",
        "verify your account",
        "verify your email",
        "confirm your account",
        "account suspended",
        "account locked",
        "security alert",
        "password expires",
        "urgent action required"
    ];


    let suspiciousCount = 0;


    for (const term of suspiciousTerms) {

        if (text.includes(term)) {
            suspiciousCount++;
        }
    }


    /*
       One suspicious phrase alone is not enough.

       Two or more suspicious phrases = spam.
    */

    if (suspiciousCount >= 2) {

        console.warn(
            "MailNova: SPAM DETECTED 🚨",
            {
                id: email.id,
                sender: email.sender,
                subject: email.subject,
                reason: "Multiple suspicious phrases",
                matches: suspiciousCount
            }
        );

        return true;
    }


    /* -----------------------------------------
       5. Excessive urgency
    ----------------------------------------- */

    const urgencyTerms = [
        "urgent",
        "immediately",
        "act now",
        "last chance",
        "action required"
    ];


    const urgencyCount =
        urgencyTerms.filter(
            term => text.includes(term)
        ).length;


    const dangerousAction =
        text.includes("click here") ||
        text.includes("verify your account") ||
        text.includes("confirm your account") ||
        text.includes("claim your reward") ||
        text.includes("claim your prize");


    if (
        urgencyCount >= 2 &&
        dangerousAction
    ) {

        console.warn(
            "MailNova: SPAM DETECTED 🚨",
            {
                id: email.id,
                sender: email.sender,
                subject: email.subject,
                reason: "Urgency + dangerous action"
            }
        );

        return true;
    }


    return false;
}

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


  const isSpam =
    detectMailnovaSpam(email);
if (isSpam) {

    console.log(
        "MailNova: SPAM CARD RENDERED 🚨",
        email.sender,
        "|",
        email.subject
    );
}

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

${
    isSpam
        ? `
            <span
                class="mailnova-spam-badge"
                title="MailNova detected this message as spam"
                style="
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    margin-left:8px;
                    padding:3px 8px;
                    border-radius:6px;
                      background:#dc2626;
                    color:#ffffff;
                    font-size:11px;
                    font-weight:800;
                    letter-spacing:.5px;
                    line-height:1;
                 box-shadow:0 2px 6px rgba(220,38,38,.25);
                "
            >
                🚨 SPAM
            </span>
        `
        : ""
}


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
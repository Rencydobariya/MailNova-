/* =========================================
   MAILNOVA PRIORITY ENGINE
   Smart AI-Like Priority
   Focus + Importance + Recency
========================================= */

let mailnovaPriorityFocus = "unread";


/* =========================================
   PRIORITY FOCUS
========================================= */

function setMailnovaPriorityFocus(focus) {

    if (
        focus !== "unread" &&
        focus !== "all" &&
        focus !== "read"
    ) {
        focus = "unread";
    }

    mailnovaPriorityFocus = focus;

    console.log(
        "MailNova: Priority focus:",
        mailnovaPriorityFocus
    );
}


/* =========================================
   SAFE DATE
========================================= */

function getEmailTimestamp(email) {

    if (!email || !email.date) {
        return 0;
    }

    const timestamp =
        new Date(email.date).getTime();

    return Number.isFinite(timestamp)
        ? timestamp
        : 0;
}


/* =========================================
   EMAIL AGE
========================================= */

function getEmailAgeDays(email) {

    const timestamp =
        getEmailTimestamp(email);

    if (!timestamp) {
        return 99999;
    }

    return Math.max(
        0,
        (Date.now() - timestamp) /
        (1000 * 60 * 60 * 24)
    );
}


/* =========================================
   RECENCY SCORE

   Main useful window:
   0 - 60 days
========================================= */

function calculateRecencyScore(email) {

    const ageDays =
        getEmailAgeDays(email);


    if (ageDays <= 1) {
        return 70;
    }

    if (ageDays <= 3) {
        return 66;
    }

    if (ageDays <= 7) {
        return 60;
    }

    if (ageDays <= 14) {
        return 54;
    }

    if (ageDays <= 21) {
        return 48;
    }

    if (ageDays <= 30) {
        return 42;
    }

    if (ageDays <= 45) {
        return 35;
    }

    if (ageDays <= 60) {
        return 28;
    }

    if (ageDays <= 90) {
        return 17;
    }

    if (ageDays <= 120) {
        return 8;
    }

    if (ageDays <= 180) {
        return 1;
    }

    if (ageDays <= 365) {
        return -10;
    }

    return -25;
}


/* =========================================
   RECENCY BAND

   Used to prevent very old emails
   from dominating recent useful emails.
========================================= */

function getRecencyBand(email) {

    const ageDays =
        getEmailAgeDays(email);


    if (ageDays <= 60) {
        return 4;
    }

    if (ageDays <= 90) {
        return 3;
    }

    if (ageDays <= 120) {
        return 2;
    }

    if (ageDays <= 180) {
        return 1;
    }

    return 0;
}


/* =========================================
   HIGH VALUE TEXT
========================================= */

function calculateTextPriorityScore(email) {

    const text = (

        (
            email?.subject ||
            ""
        ) +

        " " +

        (
            email?.snippet ||
            ""
        )

    ).toLowerCase();


    let score = 0;


    /* =====================================
       VERY HIGH IMPORTANCE
    ===================================== */

    const highPriorityPatterns = [

        "action required",
        "urgent",
        "immediately",
        "deadline",
        "exam",
        "exam schedule",
        "placement",
        "job offer",
        "offer letter",
        "joining",
        "interview",
        "interview invitation",
        "payment due",
        "fee due",
        "invoice due",
        "security alert",
        "security notice",
        "verification required",
        "otp",
        "one time password",
        "important notice",
        "account alert",
        "fraud alert",
        "login alert"

    ];


    highPriorityPatterns.forEach(
        word => {

            if (text.includes(word)) {
                score += 12;
            }

        }
    );


    /* =====================================
       MEDIUM IMPORTANCE
    ===================================== */

    const mediumPriorityPatterns = [

        "meeting",
        "assignment",
        "submission",
        "registration",
        "application",
        "reminder",
        "appointment",
        "project",
        "result",
        "admission",
        "certificate",
        "schedule",
        "orientation",
        "transaction",
        "statement",
        "emi",
        "due date",
        "payment successful",
        "payment failed"

    ];


    mediumPriorityPatterns.forEach(
        word => {

            if (text.includes(word)) {
                score += 6;
            }

        }
    );


    /* =====================================
       LOW VALUE CONTENT
    ===================================== */

    const lowPriorityPatterns = [

        "sale",
        "discount",
        "coupon",
        "newsletter",
        "advertisement",
        "advertising",
        "promotion",
        "promotional",
        "deal",
        "shop now",
        "limited time offer",
        "unsubscribe",
        "special offer"

    ];


    lowPriorityPatterns.forEach(
        word => {

            if (text.includes(word)) {
                score -= 10;
            }

        }
    );


    return Math.max(
        -30,
        Math.min(
            score,
            45
        )
    );
}


/* =========================================
   CATEGORY SCORE
========================================= */

function calculateCategoryScore(email) {

    switch (email?.category) {

        case "Banking":
            return 12;

        case "Education":
            return 11;

        case "Work":
            return 11;

        case "Personal":
            return 5;

        case "Shopping":
            return -2;

        case "Social":
            return -1;

        case "Promotion":
            return -10;

        default:
            return 0;
    }
}


/* =========================================
   GMAIL IMPORTANCE SCORE
========================================= */

function calculateImportanceScore(email) {

    let score = 0;


    if (email?.important) {
        score += 35;
    }


    if (email?.starred) {
        score += 18;
    }


    return score;
}


/* =========================================
   READ / UNREAD SCORE

   This does NOT decide global order
   in ALL mode.

   Focus mode uses it as a small bonus.
========================================= */

function calculateReadUnreadScore(email) {

    const unread =
        Boolean(
            email &&
            email.unread
        );


    if (
        mailnovaPriorityFocus ===
        "unread"
    ) {

        return unread
            ? 8
            : 0;
    }


    if (
        mailnovaPriorityFocus ===
        "read"
    ) {

        return unread
            ? 0
            : 8;
    }


    return 0;
}


/* =========================================
   USEFUL EMAIL DETECTION
========================================= */

function isUsefulEmail(email) {

    if (!email) {
        return false;
    }


    if (email.important) {
        return true;
    }


    if (email.starred) {
        return true;
    }


    const text = (

        (
            email.subject ||
            ""
        ) +

        " " +

        (
            email.snippet ||
            ""
        )

    ).toLowerCase();


    const usefulPatterns = [

        "urgent",
        "action required",
        "deadline",
        "interview",
        "exam",
        "placement",
        "job offer",
        "offer letter",
        "joining",
        "payment due",
        "fee due",
        "invoice due",
        "security alert",
        "security notice",
        "verification required",
        "otp",
        "account alert",
        "fraud alert",
        "login alert",
        "meeting",
        "assignment",
        "submission",
        "application",
        "appointment",
        "result",
        "admission",
        "certificate",
        "transaction",
        "statement",
        "due date"

    ];


    return usefulPatterns.some(
        word =>
            text.includes(word)
    );
}


/* =========================================
   LOW VALUE EMAIL
========================================= */

function isLowValueEmail(email) {

    if (!email) {
        return false;
    }


    const text = (

        (
            email.subject ||
            ""
        ) +

        " " +

        (
            email.snippet ||
            ""
        )

    ).toLowerCase();


    const lowValuePatterns = [

        "sale",
        "discount",
        "coupon",
        "newsletter",
        "advertisement",
        "advertising",
        "promotion",
        "promotional",
        "deal",
        "shop now",
        "limited time offer",
        "unsubscribe",
        "special offer"

    ];


    return lowValuePatterns.some(
        word =>
            text.includes(word)
    );
}


/* =========================================
   MAIN PRIORITY SCORE

   This is the actual smart score.
========================================= */

function calculatePriority(email) {

    if (!email) {
        return 0;
    }


    let score = 0;


    /* =====================================
       IMPORTANCE
    ===================================== */

    score +=
        calculateImportanceScore(
            email
        );


    /* =====================================
       READ / UNREAD FOCUS BONUS
    ===================================== */

    score +=
        calculateReadUnreadScore(
            email
        );


    /* =====================================
       CATEGORY
    ===================================== */

    score +=
        calculateCategoryScore(
            email
        );


    /* =====================================
       TEXT INTELLIGENCE
    ===================================== */

    score +=
        calculateTextPriorityScore(
            email
        );


    /* =====================================
       RECENCY
    ===================================== */

    score +=
        calculateRecencyScore(
            email
        );


    /* =====================================
       OLD MAIL PENALTY
    ===================================== */

    const ageDays =
        getEmailAgeDays(email);


    if (ageDays > 60) {
        score -= 8;
    }


    if (ageDays > 120) {
        score -= 12;
    }


    if (ageDays > 180) {
        score -= 15;
    }


    /* =====================================
       LOW VALUE EXTRA PENALTY
    ===================================== */

    if (
        isLowValueEmail(email)
    ) {

        score -= 8;

    }


    return Math.max(
        0,
        Math.round(score)
    );
}


/* =========================================
   PRIORITY BADGE
========================================= */

function getPriorityBadge(email) {

    const score =
        calculatePriority(email);


    if (score >= 105) {

        return {
            rating: "★ 5.0",
            className: "priority-5"
        };

    }


    if (score >= 85) {

        return {
            rating: "★ 4.5",
            className: "priority-45"
        };

    }


    if (score >= 65) {

        return {
            rating: "★ 4.0",
            className: "priority-4"
        };

    }


    if (score >= 45) {

        return {
            rating: "★ 3.5",
            className: "priority-35"
        };

    }


    return {
        rating: "★ 3.0",
        className: "priority-3"
    };
}


/* =========================================
   FOCUS GROUP

   HARD RULE:

   UNREAD FIRST
   → unread block first

   READ FIRST
   → read block first

   ALL
   → no read/unread grouping
========================================= */

function getFocusGroup(email) {

    const unread =
        Boolean(
            email &&
            email.unread
        );


    /* =====================================
       UNREAD FIRST
    ===================================== */

    if (
        mailnovaPriorityFocus ===
        "unread"
    ) {

        return unread
            ? 2
            : 1;
    }


    /* =====================================
       READ FIRST
    ===================================== */

    if (
        mailnovaPriorityFocus ===
        "read"
    ) {

        return unread
            ? 1
            : 2;
    }


    /* =====================================
       ALL EMAILS
    ===================================== */

    return 1;
}


/* =========================================
   SMART SORT

   Order:

   1. Focus
   2. Recency band
   3. Priority
   4. Recent date
   5. Read/unread tie-break
========================================= */

function sortEmailsByPriority(emails) {

    if (
        !Array.isArray(emails)
    ) {
        return;
    }


    emails.sort(
        (a, b) => {

            /* =================================
               1. SETTINGS FOCUS
            ================================= */

            const focusA =
                getFocusGroup(a);

            const focusB =
                getFocusGroup(b);


            if (
                focusA !==
                focusB
            ) {

                return (
                    focusB -
                    focusA
                );

            }


            /* =================================
               2. RECENCY BAND

               Recent 60-day emails get
               preference over old emails.
            ================================= */

            const bandA =
                getRecencyBand(a);

            const bandB =
                getRecencyBand(b);


            if (
                bandA !==
                bandB
            ) {

                return (
                    bandB -
                    bandA
                );

            }


            /* =================================
               3. SMART PRIORITY SCORE
            ================================= */

            const scoreA =
                calculatePriority(a);

            const scoreB =
                calculatePriority(b);


            if (
                scoreA !==
                scoreB
            ) {

                return (
                    scoreB -
                    scoreA
                );

            }


            /* =================================
               4. NEWER EMAIL FIRST
            ================================= */

            const dateA =
                getEmailTimestamp(a);

            const dateB =
                getEmailTimestamp(b);


            if (
                dateA !==
                dateB
            ) {

                return (
                    dateB -
                    dateA
                );

            }


            /* =================================
               5. FINAL TIE BREAK
            ================================= */

            if (
                Boolean(a.unread) !==
                Boolean(b.unread)
            ) {

                return a.unread
                    ? -1
                    : 1;

            }


            return 0;

        }
    );
}
/* =========================================
   MAILNOVA PRIORITY ENGINE
   Smart + Recency Aware Priority System
========================================= */


/* =========================================
   PRIORITY SETTINGS
========================================= */

let mailnovaPriorityFocus = "unread";


/* =========================================
   LOAD PRIORITY FOCUS
========================================= */

function setMailnovaPriorityFocus(
    focus
) {

    if (
        focus !== "unread" &&
        focus !== "all" &&
        focus !== "read"
    ) {

        focus = "unread";

    }


    mailnovaPriorityFocus =
        focus;


    console.log(
        "MailNova: Priority focus:",
        mailnovaPriorityFocus
    );

}


/* =========================================
   RECENCY SCORE
========================================= */

function calculateRecencyScore(
    email
) {

    if (
        !email ||
        !email.date
    ) {

        return 0;

    }


    const emailTime =
        new Date(
            email.date
        ).getTime();


    if (
        isNaN(emailTime)
    ) {

        return 0;

    }


    const now =
        Date.now();


    const ageDays =
        Math.max(
            0,
            (
                now -
                emailTime
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    /*
       Recent emails receive a bonus.

       0 - 7 days      = very high
       8 - 30 days     = high
       1 - 3 months    = medium
       3 - 6 months    = lower
       6 - 12 months   = low
       1+ year         = strong age penalty
    */


    if (ageDays <= 7) {

        return 25;

    }


    if (ageDays <= 30) {

        return 22;

    }


    if (ageDays <= 90) {

        return 18;

    }


    if (ageDays <= 180) {

        return 12;

    }


    if (ageDays <= 365) {

        return 6;

    }


    if (ageDays <= 730) {

        return 0;

    }


    /*
       Older than 2 years.
       Gradually reduce score.
    */

    const yearsOld =
        ageDays / 365;


    return Math.max(
        -30,
        -Math.floor(
            (yearsOld - 2) * 12
        )
    );

}


/* =========================================
   READ / UNREAD FOCUS
========================================= */

function calculateReadUnreadScore(
    email
) {

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
            ? 22
            : 0;

    }


    /* =====================================
       READ FIRST
    ===================================== */

    if (
        mailnovaPriorityFocus ===
        "read"
    ) {

        return unread
            ? 0
            : 12;

    }


    /* =====================================
       ALL EMAILS
    ===================================== */

    return 0;

}


/* =========================================
   MAIN PRIORITY CALCULATION
========================================= */

function calculatePriority(
    email
) {

    if (!email) {

        return 0;

    }


    let score = 0;


    /* =====================================
       GMAIL IMPORTANT
    ===================================== */

    if (
        email.important
    ) {

        score += 35;

    }


    /* =====================================
       STARRED
    ===================================== */

    if (
        email.starred
    ) {

        score += 20;

    }


    /* =====================================
       UNREAD
       
       Base unread importance.
    ===================================== */

    if (
        email.unread
    ) {

        score += 15;

    }


    /* =====================================
       READ / UNREAD PREFERENCE
    ===================================== */

    score +=
        calculateReadUnreadScore(
            email
        );


    /* =====================================
       CATEGORY
    ===================================== */

    switch (
        email.category
    ) {

        case "Work":

            score += 18;

            break;


        case "Education":

            score += 20;

            break;


        case "Banking":

            score += 22;

            break;


        case "Personal":

            score += 10;

            break;


        case "Shopping":

            score += 4;

            break;


        case "Social":

            score += 3;

            break;


        case "Promotion":

            score += 0;

            break;

    }


    /* =====================================
       TEXT ANALYSIS
    ===================================== */

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


    /* =====================================
       HIGH PRIORITY WORDS
    ===================================== */

    const highPriorityWords = [

        "urgent",
        "important",
        "deadline",
        "interview",
        "exam",
        "meeting",
        "placement",
        "offer",
        "offer letter",
        "internship",
        "joining",
        "payment",
        "invoice",
        "otp",
        "verification",
        "security",
        "action required"

    ];


    highPriorityWords.forEach(
        word => {

            if (
                text.includes(
                    word
                )
            ) {

                score += 15;

            }

        }
    );


    /* =====================================
       LOW PRIORITY WORDS
    ===================================== */

    const lowPriorityWords = [

        "sale",
        "discount",
        "offer ends",
        "coupon",
        "deal",
        "shopping",
        "promotion",
        "advertisement",
        "newsletter"

    ];


    lowPriorityWords.forEach(
        word => {

            if (
                text.includes(
                    word
                )
            ) {

                score -= 10;

            }

        }
    );


    /* =====================================
       RECENCY
       
       This is the important new part.
    ===================================== */

    score +=
        calculateRecencyScore(
            email
        );


    /* =====================================
       FINAL SCORE
    ===================================== */

    score =
        Math.max(
            score,
            0
        );


    return score;

}


/* =========================================
   PRIORITY BADGE
========================================= */

function getPriorityBadge(
    email
) {

    const score =
        calculatePriority(
            email
        );


    if (
        score >= 100
    ) {

        return {

            rating: "★ 5.0",

            className:
                "priority-5"

        };

    }


    if (
        score >= 75
    ) {

        return {

            rating: "★ 4.5",

            className:
                "priority-45"

        };

    }


    if (
        score >= 55
    ) {

        return {

            rating: "★ 4.0",

            className:
                "priority-4"

        };

    }


    if (
        score >= 35
    ) {

        return {

            rating: "★ 3.5",

            className:
                "priority-35"

        };

    }


    return {

        rating: "★ 3.0",

        className:
            "priority-3"

    };

}


/* =========================================
   SORT BY PRIORITY
========================================= */

function sortEmailsByPriority(
    emails
) {

    if (
        !Array.isArray(
            emails
        )
    ) {

        return;

    }


    emails.sort(
        (a, b) => {

            const scoreA =
                calculatePriority(
                    a
                );


            const scoreB =
                calculatePriority(
                    b
                );


            const difference =
                scoreB -
                scoreA;


            if (
                difference !== 0
            ) {

                return difference;

            }


            /*
               If priority scores are equal,
               newer email comes first.
            */

            const dateA =
                new Date(
                    a.date || 0
                ).getTime();


            const dateB =
                new Date(
                    b.date || 0
                ).getTime();


            return (
                dateB -
                dateA
            );

        }
    );

}
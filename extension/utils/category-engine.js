function detectCategory(email) {

    const text = (
        (email.sender || "") +
        " " +
        (email.subject || "") +
        " " +
        (email.snippet || "")
    ).toLowerCase();


    // =========================
    // SHOPPING
    // =========================

    if (
        text.includes("amazon") ||
        text.includes("flipkart") ||
        text.includes("myntra")
    ) {
        return "Shopping";
    }


    // =========================
    // BANKING
    // =========================

    if (
        text.includes("bank") ||
        text.includes("upi") ||
        text.includes("payment") ||
        text.includes("transaction")
    ) {
        return "Banking";
    }


    // =========================
    // WORK
    // =========================

    if (
        text.includes("interview") ||
        text.includes("career") ||
        text.includes("job")
    ) {
        return "Work";
    }


    // =========================
    // EDUCATION
    // =========================

    if (
        text.includes("college") ||
        text.includes("exam") ||
        text.includes("university")
    ) {
        return "Education";
    }


    // =========================
    // DEFAULT
    // =========================

    return "Personal";
}



function getCategoryCounts(emails) {

    const counts = {

        All: emails.length,

        Work: 0,

        Education: 0,

        Shopping: 0,

        Banking: 0,

        Personal: 0

    };


    emails.forEach(email => {

        if (counts[email.category] !== undefined) {

            counts[email.category]++;

        }

    });


    return counts;

}
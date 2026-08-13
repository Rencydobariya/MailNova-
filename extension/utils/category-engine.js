
function detectCategory(email) {

    const text = (
        email.sender +
        " " +
        email.subject +
        " " +
        email.snippet
    ).toLowerCase();

    if (
        text.includes("amazon") ||
        text.includes("flipkart") ||
        text.includes("myntra")
    ) {
        return "Shopping";
    }

    if (
        text.includes("bank") ||
        text.includes("upi") ||
        text.includes("payment") ||
        text.includes("transaction")
    ) {
        return "Banking";
    }

    if (
        text.includes("interview") ||
        text.includes("career") ||
        text.includes("job")
    ) {
        return "Work";
    }

    if (
        text.includes("college") ||
        text.includes("exam") ||
        text.includes("university")
    ) {
        return "Education";
    }

    return "Personal";

}
function getCategoryCounts(emails){

    const counts={

        All:emails.length,

        Work:0,

        Education:0,

        Shopping:0,

        Banking:0,

        Personal:0

    };

    emails.forEach(email=>{

        counts[email.category]++;

    });

    return counts;

}
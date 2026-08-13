function calculatePriority(email){
    let score = 0;
    if(email.important)
        score += 35;

    if(email.starred)
        score += 20;

    if(email.unread)
        score += 15;

    switch(email.category){

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
    const text =
    (
        email.subject + " " +
        email.snippet
    ).toLowerCase();

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
    highPriorityWords.forEach(word=>{
        if(text.includes(word))
            score += 15;
    });

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
    lowPriorityWords.forEach(word=>{

        if(text.includes(word))

            score -= 10;

    });

    score = Math.max(score,0);
    return score;

}

function getPriorityBadge(email){

    const score = calculatePriority(email);
    if(score>=80)
        return {

            rating:"★ 5.0",
            className:"priority-5"

        };
    if(score>=60)
        return{

            rating:"★ 4.5",

            className:"priority-45"

        };
    if(score>=45)

        return{

            rating:"★ 4.0",

            className:"priority-4"

        };
    if(score>=25)

        return{

            rating:"★ 3.5",

            className:"priority-35"

        };
    return{

        rating:"★ 3.0",

        className:"priority-3"
    };
}
function sortEmailsByPriority(emails){
    emails.sort((a,b)=>{

        return calculatePriority(b) -

               calculatePriority(a);
    });
}'[/;'
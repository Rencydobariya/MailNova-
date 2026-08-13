

function filterEmails(emails, category) {

    if (category === "All") {
        return emails;
    }

    return emails.filter(email => email.category === category);

}
function renderEmailList() {

    return `

        <div class="mailnova-email-list"></div>

    `;

}


function renderEmails(emailList) {

    const container =
        document.querySelector(
            ".mailnova-email-list"
        );

    if (!container) return;


    container.innerHTML =
        emailList
            .map(createEmailCard)
            .join("");

}
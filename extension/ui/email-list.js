function renderEmailList() {

    return `

        <div class="mailnova-email-list">
            <div class="mailnova-email-list-status" role="status" aria-live="polite">
                <span class="mailnova-email-list-spinner" aria-hidden="true"></span>
                <span>Loading your latest emails…</span>
            </div>
        </div>

    `;

}


function setMailnovaEmailListStatus(message, options = {}) {
    const container = document.querySelector(".mailnova-email-list");
    if (!container) return;

    const status = document.createElement("div");
    status.className = "mailnova-email-list-status";
    status.setAttribute("role", options.loading ? "status" : "alert");
    status.setAttribute("aria-live", "polite");

    if (options.loading) {
        const spinner = document.createElement("span");
        spinner.className = "mailnova-email-list-spinner";
        spinner.setAttribute("aria-hidden", "true");
        status.appendChild(spinner);
    }

    const text = document.createElement("span");
    text.textContent = message;
    status.appendChild(text);

    if (options.retry) {
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "mailnova-email-list-retry";
        retry.textContent = "Try again";
        retry.addEventListener("click", async () => {
            setMailnovaEmailListStatus("Loading your latest emails…", { loading: true });
            try {
                await forceRefreshMailnova();
                if (!Array.isArray(mailnovaEmails) || mailnovaEmails.length === 0) {
                    setMailnovaEmailListStatus(
                        "Could not load Gmail. Check your connection and Google account in Settings, then try again.",
                        { retry: true }
                    );
                }
            } catch (_error) {
                setMailnovaEmailListStatus(
                    "Could not load Gmail. Check your connection and Google account in Settings, then try again.",
                    { retry: true }
                );
            }
        });
        status.appendChild(retry);
    }

    container.replaceChildren(status);
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

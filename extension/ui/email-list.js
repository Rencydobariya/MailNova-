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

    if (options.connect) {
        const connect = document.createElement("button");
        connect.type = "button";
        connect.className = "mailnova-email-list-retry";
        connect.textContent = "Connect Google";
        connect.addEventListener("click", async () => {
            setMailnovaEmailListStatus("Opening Google's secure sign-in…", { loading: true });
            try {
                const response = await mailnovaApiFetch(
                    `${MAILNOVA_API}/gmail/test`,
                    { method: "GET", cache: "no-store", interactive: true }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Google account could not be verified.");
                }

                await ensureMailnovaUserCache();
                setMailnovaEmailListStatus("Connected. Loading your emails…", { loading: true });
                await forceRefreshMailnova();
                if (!Array.isArray(mailnovaEmails) || mailnovaEmails.length === 0) {
                    setMailnovaEmailListStatus(
                        "Google is connected, but MailNova could not load messages. Try again.",
                        { retry: true }
                    );
                }
            } catch (error) {
                const errorMessage = String(error.message || "");
                setMailnovaEmailListStatus(
                    /bad client id/i.test(errorMessage)
                        ? `Google rejected extension ID ${chrome.runtime.id}. Register this ID on the Chrome Extension OAuth client in Google Cloud.`
                        : errorMessage || "Google sign-in could not be completed.",
                    { connect: true, retry: true }
                );
            }
        });
        status.appendChild(connect);
    }

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

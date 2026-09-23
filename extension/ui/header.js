function renderHeader() {

    return `

    <div class="mailnova-header">

        <div class="mailnova-title">
            🤖 MailNova AI
        </div>

        <div class="mailnova-header-buttons">

            <button
                id="mn-refresh"
                title="Refresh"
                aria-label="Refresh MailNova"
            >
                🔄
            </button>

            <button
                id="mn-notifications"
                title="Notifications"
                aria-label="Notifications"
            >
                🔔
                <span
                    id="mailnova-notification-badge"
                    class="mailnova-notification-badge"
                    aria-hidden="true"
                ></span>
            </button>

            <button
                id="mn-width-plus"
                title="Increase Width"
                aria-label="Increase Workspace Width"
            >
                ➕
            </button>

            <button
                id="mn-width-minus"
                title="Decrease Width"
                aria-label="Decrease Workspace Width"
            >
                ➖
            </button>

            <button
                id="mn-settings"
                title="Settings"
                aria-label="MailNova Settings"
            >
                ⚙
            </button>

            <button
                id="mn-close"
                title="Close"
                aria-label="Close MailNova"
            >
                ✖
            </button>

        </div>

    </div>

    `;

}
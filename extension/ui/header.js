function renderHeader() {

    return `

    <div class="mailnova-header">

        <div class="mailnova-title">
            🤖 MailNova AI
        </div>

        <div class="mailnova-header-buttons">

            <button
                id="mn-refresh"
                class="mn-refresh-button"
                title="Refresh"
                aria-label="Refresh MailNova"
                type="button"
            >
                <svg
                    class="mn-refresh-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M20 11a8 8 0 0 0-15.3-3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />

                    <path
                        d="M4 4v4h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M4 13a8 8 0 0 0 15.3 3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />

                    <path
                        d="M20 20v-4h-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
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
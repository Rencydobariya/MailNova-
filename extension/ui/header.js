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
                type="button"
            >
                <svg
                    class="mn-settings-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M9.7 3.7h4.6l.6 2.1c.5.2 1 .4 1.4.8l2.1-.6 2.3 4-1.6 1.5c.1.5.1 1.1 0 1.6l1.6 1.5-2.3 4-2.1-.6c-.4.3-.9.6-1.4.8l-.6 2.1H9.7l-.6-2.1c-.5-.2-1-.4-1.4-.8l-2.1.6-2.3-4 1.6-1.5a6.5 6.5 0 0 1 0-1.6L3.3 10l2.3-4 2.1.6c.4-.3.9-.6 1.4-.8l.6-2.1Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>


            <button
                id="mn-theme-toggle"
                class="mn-theme-toggle"
                title="Switch to dark theme"
                aria-label="Switch to dark theme"
                type="button"
            >
                <svg
                    class="mn-theme-toggle-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z"></path>
                </svg>
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

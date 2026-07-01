function createWorkspace() {

    // Agar pehle se open hai to kuch mat karo
    if (document.getElementById("mailnova-workspace")) return;

    // Workspace
    const workspace = document.createElement("div");
    workspace.id = "mailnova-workspace";

    workspace.innerHTML = `

        <div id="mailnova-resizer"></div>

        <div class="mailnova-header">

            <div class="mailnova-logo">
                🤖 MailNova AI
            </div>

            <div class="mailnova-actions">

                <button id="mn-refresh">🔄</button>
                <button id="mn-settings">⚙️</button>
                <button id="mn-minimize">➖</button>
                <button id="mn-close">✖</button>

            </div>

        </div>

        <div class="mailnova-body">

            <h2>Welcome to MailNova 🚀</h2>

            <p>

                AI Email Workspace

            </p>

        </div>

    `;

    document.body.appendChild(workspace);

    // Close Button

    document
        .getElementById("mn-close")
        .addEventListener("click", () => {

            workspace.remove();

            document.body.classList.remove("mailnova-open");

        });

    // Gmail Width Adjust

    document.body.classList.add("mailnova-open");

}
let workspace = null;

function createWorkspace() {

    if (document.getElementById("mailnova-workspace")) {
        return;
    }

    workspace = document.createElement("div");
    workspace.id = "mailnova-workspace";

        workspace.innerHTML = `

        ${renderHeader()}

        ${renderSearch()}

        ${renderCategoryBar()}

        ${renderEmailList()}
        <div id="mailnova-resizer"></div>
        `;

    document.body.appendChild(workspace);
    enableWorkspaceResize(workspace);
           
        const emails = getInboxEmails();
        sortEmailsByPriority(emails);

       renderEmails(emails);
const counts = getCategoryCounts(emails);

const bar = document.getElementById("mailnova-category-bar");

bar.innerHTML = `

                <div class="mailnova-chip active" data-category="All">
                📥 All (${counts.All}) 
                </div>

                <div class="mailnova-chip" data-category="Work">
                💼 Work (${counts.Work})
                </div>

                <div class="mailnova-chip" data-category="Education">
                🎓 Education (${counts.Education})
                </div>

                <div class="mailnova-chip" data-category="Shopping">
                🛒 Shopping (${counts.Shopping})
                </div>

                <div class="mailnova-chip" data-category="Banking">
                💳 Banking (${counts.Banking})
                </div>

                <div class="mailnova-chip" data-category="Personal">
                👤 Personal (${counts.Personal})
                </div>


             `;
document.querySelectorAll(".mailnova-chip").forEach(chip => {

    chip.addEventListener("click", () => {

        document.querySelectorAll(".mailnova-chip")
            .forEach(c => c.classList.remove("active"));

        chip.classList.add("active");

        const category = chip.dataset.category;

        const filtered = filterEmails(emails, category);
        sortEmailsByPriority(filtered);
        renderEmails(filtered);

    });

});




workspace.addEventListener("click", (e) => {

    const viewButton = e.target.closest(".mn-view");

    if (!viewButton) return;

    e.preventDefault();
    e.stopPropagation();

    const emailIndex = Number(viewButton.dataset.id);

    const gmailRows = document.querySelectorAll("tr.zA");

    const gmailRow = gmailRows[emailIndex];

    if (!gmailRow) {

        console.log("Gmail row not found:", emailIndex);
        return;

    }

    // Shrink MailNova workspace smoothly
    workspace.style.width = "300px";

    // Open the original Gmail email after animation
    setTimeout(() => {

        gmailRow.click();

    }, 400);

});




           
    // refresh
    document
        .getElementById("mn-refresh")
        .addEventListener("click", refreshWorkspace);

    // close
    
    document
        .getElementById("mn-close")
        .addEventListener("click", closeWorkspace);

    document
        .getElementById("mn-width-plus")
        .addEventListener("click", increaseWidth);

    document
        .getElementById("mn-width-minus")
        .addEventListener("click", decreaseWidth);

    
}

function closeWorkspace() {

    if (workspace) {

        workspace.remove();

        workspace = null;

    }

}

function minimizeWorkspace() {

    if (!workspace) return;

    workspace.style.display = "none";

}

function restoreWorkspace() {

    if (workspace) {

        if (workspace.style.display === "none") {

            workspace.style.display = "flex";

        } else {

            workspace.style.display = "none";

        }

    }

}
function renderEmails(emailList){

    document.querySelector(".mailnova-email-list").innerHTML =
        emailList.map(createEmailCard).join("");

}
function increaseWidth() {

    const width = workspace.offsetWidth;

    if(width < 1300){

        workspace.style.width = (width + 40) + "px";

    }

}
function decreaseWidth() {

    const width = workspace.offsetWidth;

    if(width > 300){

        workspace.style.width = (width - 40) + "px";

    }

}

function refreshWorkspace() {

    const btn = document.getElementById("mn-refresh");

    btn.style.transform = "rotate(360deg)";
    btn.style.transition = "0.5s";

    setTimeout(() => {
        btn.style.transform = "rotate(0deg)";
    }, 500);

    const emails = getInboxEmails();

    sortEmailsByPriority(emails);

    renderEmails(emails);
}
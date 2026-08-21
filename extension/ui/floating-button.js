if (!document.getElementById("mailnova-ai-button")) 
    {

    const button = document.createElement("div");
    button.id = "mailnova-ai-button";

  button.innerHTML = `
    <div class="mailnova-logo-wrapper">
        <img  
            src="${chrome.runtime.getURL('assets/icons/logo_1.png')}"  
            class="mailnova-logo" 
            alt="MailNova"
        >
    </div>

    <div class="mailnova-badge">12</div>
`;

    document.body.appendChild(button);


    let isDragging = false;

    
    button.addEventListener("mousedown", () => {

        isDragging = false;

    });

    button.addEventListener("mousemove", () => {

        isDragging = true;

    });

    button.addEventListener("click", () => {

        if (isDragging) {

            isDragging = false;
            return;

        }

        if (!workspace) {

            createWorkspace();

        }

        else {

            restoreWorkspace();

        }

    });

    makeDraggable(button);

    console.log("MailNova Floating Button Loaded 🚀");

}
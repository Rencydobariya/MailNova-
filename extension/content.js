console.log("MailNova Initialized 🚀");
window.addEventListener("load", () => {

    setTimeout(() => {

        if (!document.getElementById("mailnova-workspace")) {

            createWorkspace();

        }

    }, 800);

});
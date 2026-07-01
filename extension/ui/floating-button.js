// Prevent duplicate button
if (!document.getElementById("mailnova-ai-button")) {
  const button = document.createElement("div");
  button.id = "mailnova-ai-button";

  button.innerHTML = `
        <div class="mailnova-badge">12</div>
        🤖
    `;

  document.body.appendChild(button);


  button.addEventListener("click", () => {

    createWorkspace();

});

  makeDraggable(button);
  console.log("MailNova Floating Button Loaded 🚀");
}

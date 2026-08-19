function createEmailCard(email) {
  const priority = getPriorityBadge(email);

  return `

   <div class="mailnova-email-card" data-id="${email.gmailId}">

        <div class="mailnova-card-header">

            <div class="mailnova-sender">

                ${email.sender}

            </div>

            <div class="mailnova-meta">

                <span class="mailnova-priority ${priority.className}">
                  ${priority.rating}
                </span>

                <span class="mailnova-date">
                    ${email.date}
                </span>

            </div>

        </div>

        <div class="mailnova-subject">

            ${email.subject}

        </div>

        <div class="mailnova-summary">

            ${email.snippet}

        </div>

        <div class="mailnova-card-actions">

            <button
                    class="mn-view"
                    data-id="${email.id}">

                    👁 View 

</button>
            <button class="mn-ai"  data-id="${email.id}">

             🤖 Ask AI

            </button>

            <button class="mn-reply">

                ↩ Reply
            </button>
        </div>
    </div>
    `;
}

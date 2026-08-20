function renderCategoryBar() {

    return `
    
        <div id="mailnova-category-bar"></div>
    
    `;

}


function updateCategoryBar(emails) {

    const bar =
        document.getElementById(
            "mailnova-category-bar"
        );

    if (!bar) return;


    const counts =
        getCategoryCounts(emails);


    bar.innerHTML = `

        <div
            class="mailnova-chip active"
            data-category="All">

            📥 All (${counts.All})

        </div>


        <div
            class="mailnova-chip"
            data-category="Work">

            💼 Work (${counts.Work})

        </div>


        <div
            class="mailnova-chip"
            data-category="Education">

            🎓 Education (${counts.Education})

        </div>


        <div
            class="mailnova-chip"
            data-category="Shopping">

            🛒 Shopping (${counts.Shopping})

        </div>


        <div
            class="mailnova-chip"
            data-category="Banking">

            💳 Banking (${counts.Banking})

        </div>


        <div
            class="mailnova-chip"
            data-category="Personal">

            👤 Personal (${counts.Personal})

        </div>

    `;

}
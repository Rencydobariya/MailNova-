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


    /* =====================================
       CHECK CATEGORY DETECTION SETTING
    ===================================== */

    const categoryDetectionEnabled =
        typeof isMailnovaCategoryDetectionEnabled ===
        "function"
            ? isMailnovaCategoryDetectionEnabled()
            : true;


    /* =====================================
       WHEN CATEGORY DETECTION IS OFF
       SHOW ONLY ALL + NO CATEGORIES
    ===================================== */

    if (!categoryDetectionEnabled) {

        /*
         * Important:
         * If user had selected Work/Education/etc.
         * reset filter back to All.
         */

        if (
            typeof mailnovaFilterState !==
            "undefined" &&
            mailnovaFilterState
        ) {

            mailnovaFilterState.category =
                "All";

        }


        bar.innerHTML = `

            <div
                class="mailnova-chip active"
                data-category="All">

                📥 All (${counts.All || 0})

            </div>

        `;

        return;

    }


    /* =====================================
       CATEGORY DETECTION IS ON
       SHOW ALL CATEGORIES
    ===================================== */

    bar.innerHTML = `

        <div
            class="mailnova-chip active"
            data-category="All">

            📥 All (${counts.All || 0})

        </div>


        <div
            class="mailnova-chip"
            data-category="Work">

            💼 Work (${counts.Work || 0})

        </div>


        <div
            class="mailnova-chip"
            data-category="Education">

            🎓 Education (${counts.Education || 0})

        </div>


        <div
            class="mailnova-chip"
            data-category="Shopping">

            🛒 Shopping (${counts.Shopping || 0})

        </div>


        <div
            class="mailnova-chip"
            data-category="Banking">

            💳 Banking (${counts.Banking || 0})

        </div>


        <div
            class="mailnova-chip"
            data-category="Personal">

            👤 Personal (${counts.Personal || 0})

        </div>

    `;

}
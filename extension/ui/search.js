function renderSearch(){

    return `

    <div class="mailnova-search">

        <!-- Search -->
        <div class="mailnova-search-box">

            <span class="mailnova-search-icon">
                🔍
            </span>

            <input
                id="mailnova-search-input"
                placeholder="Search emails, sender, subject or ask MailNova..."
            >

            <button id="mailnova-voice-btn">
                🎤
            </button>

        </div>


        <!-- Month Filter -->
        <div class="mailnova-month-filter">

            <span class="mailnova-month-icon">
                📅
            </span>

            <select id="mailnova-month-select">

                <option value="all">
                    All Months
                </option>

            </select>

            <span class="mailnova-month-arrow">
                ▾
            </span>

        </div>

    </div>

    `;

}






/* =========================================
   INCREASE WIDTH
========================================= */

function increaseWidth() {

    if (!workspace) return;

    const currentWidth =
        workspace.offsetWidth;

    const newWidth =
        Math.min(
            currentWidth + 50,
            1300
        );

    workspace.style.width =
        newWidth + "px";

}


/* =========================================
   DECREASE WIDTH
========================================= */

function decreaseWidth() {

    if (!workspace) return;

    const currentWidth =
        workspace.offsetWidth;

    const newWidth =
        Math.max(
            currentWidth - 50,
            300
        );

    workspace.style.width =
        newWidth + "px";

}
/* =========================================
   EMAIL SEARCH
========================================= */

function setupEmailSearch() {

    const input =
        document.getElementById(
            "mailnova-search-input"
        );

    if (!input) {

        console.error(
            "MailNova: Search input not found"
        );

        return;

    }


    input.addEventListener(
        "input",
        () => {
   applyEmailFilters();

        }
    );


    input.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                e.preventDefault();

                  applyEmailFilters();

            }

        }
    );

}


/* =========================================
   PERFORM SEARCH
========================================= */
/* =========================================
   APPLY SEARCH + MONTH FILTER
========================================= */

function applyEmailFilters() {

    const searchInput =
        document.getElementById(
            "mailnova-search-input"
        );

    const monthSelect =
        document.getElementById(
            "mailnova-month-select"
        );


    const searchQuery =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedMonth =
        monthSelect
            ? monthSelect.value
            : "all";


    let filtered =
        [...mailnovaEmails];


    /* =====================================
       SEARCH FILTER
    ===================================== */

    if (searchQuery) {

        filtered =
            filtered.filter(email => {

                const sender =
                    (
                        email.sender || ""
                    ).toLowerCase();


                const subject =
                    (
                        email.subject || ""
                    ).toLowerCase();


                const snippet =
                    (
                        email.snippet || ""
                    ).toLowerCase();


                return (

                    sender.includes(
                        searchQuery
                    ) ||

                    subject.includes(
                        searchQuery
                    ) ||

                    snippet.includes(
                        searchQuery
                    )

                );

            });

    }


    /* =====================================
       MONTH FILTER
    ===================================== */

    if (
        selectedMonth &&
        selectedMonth !== "all"
    ) {

        filtered =
            filtered.filter(email => {

                if (!email.date) {
                    return false;
                }


                const date =
                    new Date(
                        email.date
                    );


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return false;

                }


                const emailMonth =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;


                return (
                    emailMonth ===
                    selectedMonth
                );

            });

    }


    /* =====================================
       SORT + RENDER
    ===================================== */

    sortEmailsByPriority(
        filtered
    );


    renderEmails(
        filtered
    );


    console.log(
        "MailNova Filters:",
        {
            search: searchQuery || "All",
            month: selectedMonth,
            results: filtered.length
        }
    );

}

/* =========================================
   MONTH FILTER
========================================= */

function setupMonthFilter() {

    const select =
        document.getElementById(
            "mailnova-month-select"
        );

    if (!select) return;


    /*
       January to December
       Always show all months
    */

    const currentYear =
        new Date().getFullYear();


    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    select.innerHTML = `
        <option value="all">
            All Months
        </option>
    `;


    months.forEach((month, index) => {

        const option =
            document.createElement("option");

        option.value =
            `${currentYear}-${String(
                index + 1
            ).padStart(2, "0")}`;

        option.textContent =
            month;

        select.appendChild(option);

    });


   select.addEventListener(
    "change",
    () => {

        applyEmailFilters();

    }
);

}













// function renderSearch(){

// return `

// <div class="mailnova-search">

// <div class="mailnova-search-box">

// <span class="mailnova-search-icon">
// 🔍
// </span>

// <input
// id="mailnova-search-input"
// placeholder="Search emails, sender, subject or ask MailNova..."
// >

// <button id="mailnova-voice-btn">
// 🎤
// </button>

// </div>

// </div>

// `;

// }



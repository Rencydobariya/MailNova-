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


        <!-- Custom Month Filter -->
        <div class="mailnova-month-filter">

            <button
                id="mailnova-month-button"
                type="button"
            >

                <span class="mailnova-month-icon">
                    📅
                </span>

                <span id="mailnova-selected-month">
                    All Months
                </span>

                <span class="mailnova-month-arrow">
                    ▾
                </span>

            </button>


            <div
                id="mailnova-month-dropdown"
                class="mailnova-month-dropdown"
            >

                <!-- Months will be added by JavaScript -->

            </div>

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

   


    const searchQuery =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

const selectedMonth =
    window.mailnovaSelectedMonth ||
    "all";
   


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

/* =========================================
   MONTH FILTER
========================================= */

function setupMonthFilter() {

    const button =
        document.getElementById(
            "mailnova-month-button"
        );

    const dropdown =
        document.getElementById(
            "mailnova-month-dropdown"
        );

    const selectedMonth =
        document.getElementById(
            "mailnova-selected-month"
        );


    if (
        !button ||
        !dropdown ||
        !selectedMonth
    ) {

        console.error(
            "MailNova: Month filter elements not found"
        );

        return;

    }


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


    /* =====================================
       CREATE MONTH OPTIONS
    ===================================== */

    dropdown.innerHTML = "";


    // All Months

    const allOption =
        document.createElement("div");

    allOption.className =
        "mailnova-month-option active";

    allOption.dataset.value =
        "all";

    allOption.textContent =
        "All Months";

    dropdown.appendChild(
        allOption
    );


    // January - December

    months.forEach(
        (month, index) => {

            const option =
                document.createElement("div");

            option.className =
                "mailnova-month-option";

            option.dataset.value =
                `${currentYear}-${String(
                    index + 1
                ).padStart(2, "0")}`;

            option.textContent =
                month;

            dropdown.appendChild(
                option
            );

        }
    );


    /* =====================================
       OPEN / CLOSE DROPDOWN
    ===================================== */

    button.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            dropdown.classList.toggle(
                "open"
            );

            button.classList.toggle(
                "open"
            );

        }
    );


    /* =====================================
       MONTH SELECTION
    ===================================== */

    dropdown.addEventListener(
        "click",
        (e) => {

            const option =
                e.target.closest(
                    ".mailnova-month-option"
                );


            if (!option) return;


            const value =
                option.dataset.value;


            selectedMonth.textContent =
                option.textContent;


            dropdown
                .querySelectorAll(
                    ".mailnova-month-option"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            option.classList.add(
                "active"
            );


            dropdown.classList.remove(
                "open"
            );

            button.classList.remove(
                "open"
            );


            // Store selected month

            window.mailnovaSelectedMonth =
                value;


            applyEmailFilters();

        }
    );


    /* =====================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================== */

    document.addEventListener(
        "click",
        (e) => {

            if (
                !e.target.closest(
                    ".mailnova-month-filter"
                )
            ) {

                dropdown.classList.remove(
                    "open"
                );

                button.classList.remove(
                    "open"
                );

            }

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


        <!-- Custom Month Filter -->
        <div class="mailnova-month-filter">

            <button
                id="mailnova-month-button"
                type="button"
            >

                <span class="mailnova-month-icon">
                    📅
                </span>

                <span id="mailnova-selected-month">
                    All Months
                </span>

                <span class="mailnova-month-arrow">
                    ▾
                </span>

            </button>


            <div
                id="mailnova-month-dropdown"
                class="mailnova-month-dropdown"
            >

                <!-- Months will be added by JavaScript -->

            </div>

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

   


    const searchQuery =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

const selectedMonth =
    window.mailnovaSelectedMonth ||
    "all";
   


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

/* =========================================
   MONTH FILTER
========================================= */

function setupMonthFilter() {

    const button =
        document.getElementById(
            "mailnova-month-button"
        );

    const dropdown =
        document.getElementById(
            "mailnova-month-dropdown"
        );

    const selectedMonth =
        document.getElementById(
            "mailnova-selected-month"
        );


    if (
        !button ||
        !dropdown ||
        !selectedMonth
    ) {

        console.error(
            "MailNova: Month filter elements not found"
        );

        return;

    }


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


    /* =====================================
       CREATE MONTH OPTIONS
    ===================================== */

    dropdown.innerHTML = "";


    // All Months

    const allOption =
        document.createElement("div");

    allOption.className =
        "mailnova-month-option active";

    allOption.dataset.value =
        "all";

    allOption.textContent =
        "All Months";

    dropdown.appendChild(
        allOption
    );


    // January - December

    months.forEach(
        (month, index) => {

            const option =
                document.createElement("div");

            option.className =
                "mailnova-month-option";

            option.dataset.value =
                `${currentYear}-${String(
                    index + 1
                ).padStart(2, "0")}`;

            option.textContent =
                month;

            dropdown.appendChild(
                option
            );

        }
    );


    /* =====================================
       OPEN / CLOSE DROPDOWN
    ===================================== */

    button.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            dropdown.classList.toggle(
                "open"
            );

            button.classList.toggle(
                "open"
            );

        }
    );


    /* =====================================
       MONTH SELECTION
    ===================================== */

    dropdown.addEventListener(
        "click",
        (e) => {

            const option =
                e.target.closest(
                    ".mailnova-month-option"
                );


            if (!option) return;


            const value =
                option.dataset.value;


            selectedMonth.textContent =
                option.textContent;


            dropdown
                .querySelectorAll(
                    ".mailnova-month-option"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            option.classList.add(
                "active"
            );


            dropdown.classList.remove(
                "open"
            );

            button.classList.remove(
                "open"
            );


            // Store selected month

            window.mailnovaSelectedMonth =
                value;


            applyEmailFilters();

        }
    );


    /* =====================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================== */

    document.addEventListener(
        "click",
        (e) => {

            if (
                !e.target.closest(
                    ".mailnova-month-filter"
                )
            ) {

                dropdown.classList.remove(
                    "open"
                );

                button.classList.remove(
                    "open"
                );

            }

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



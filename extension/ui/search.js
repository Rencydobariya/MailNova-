function renderSearch() {

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

            mailnovaFilterState.search =
                input.value
                    .trim()
                    .toLowerCase();

            applyAllMailnovaFilters();

        }
    );


    input.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                e.preventDefault();

                mailnovaFilterState.search =
                    input.value
                        .trim()
                        .toLowerCase();

                applyAllMailnovaFilters();

            }

        }
    );

}


/* =========================================
   APPLY EMAIL FILTERS
   Compatibility wrapper
========================================= */

function applyEmailFilters() {

    const searchInput =
        document.getElementById(
            "mailnova-search-input"
        );


    mailnovaFilterState.search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    applyAllMailnovaFilters();

}


/* =========================================
   CLOSE MONTH DROPDOWN
========================================= */

function closeMailnovaMonthDropdown() {

    const dropdown =
        document.getElementById(
            "mailnova-month-dropdown"
        );

    const button =
        document.getElementById(
            "mailnova-month-button"
        );


    if (dropdown) {

        dropdown.classList.remove(
            "open"
        );

    }


    if (button) {

        button.classList.remove(
            "open"
        );

    }

}


/* =========================================
   CLOSE SORT DROPDOWN
========================================= */

function closeMailnovaSortDropdown() {

    const sortMenu =
        document.getElementById(
            "mailnova-sort-menu"
        );


    if (!sortMenu) {

        return;

    }


    sortMenu.classList.remove(
        "open"
    );


    /*
       Sort menu ke existing JS mein
       inline display bhi set hota hai.

       Isliye sirf "open" remove karna
       enough nahi hai.
    */

    sortMenu.style.display =
        "none";

    sortMenu.style.visibility =
        "hidden";

    sortMenu.style.opacity =
        "0";

}


/* =========================================
   MAILNOVA FILTER MENU CONTROLLER
========================================= */

/*
   IMPORTANT:

   Month aur Sort ek time par kabhi
   open nahi honge.

   Capture phase isliye use kiya gaya hai
   kyunki existing Sort button handler
   stopPropagation() use karta hai.
*/

function setupMailnovaFilterMenuController() {

    if (
        window.mailnovaFilterMenuControllerReady
    ) {

        return;

    }


    window.mailnovaFilterMenuControllerReady =
        true;


    document.addEventListener(
        "click",
        (e) => {

            const target =
                e.target;


            if (!target) {

                return;

            }


            /* =====================================
               MONTH BUTTON CLICK
            ===================================== */

            const monthButton =
                target.closest(
                    "#mailnova-month-button"
                );


            if (monthButton) {

                /*
                   Month open hone se pehle
                   Sort ko definitely close karo.
                */

                closeMailnovaSortDropdown();

                return;

            }


            /* =====================================
               SORT BUTTON CLICK
            ===================================== */

            const sortButton =
                target.closest(
                    "#mailnova-sort-btn"
                );


            if (sortButton) {

                /*
                   Sort open hone se pehle
                   Month ko definitely close karo.
                */

                closeMailnovaMonthDropdown();

                return;

            }


            /* =====================================
               CLICK INSIDE MONTH
            ===================================== */

            const insideMonth =
                target.closest(
                    ".mailnova-month-filter"
                );


            if (insideMonth) {

                return;

            }


            /* =====================================
               CLICK INSIDE SORT
            ===================================== */

            const insideSort =
                target.closest(
                    "#mailnova-sort-menu, .mailnova-sort-wrapper"
                );


            if (insideSort) {

                return;

            }


            /* =====================================
               CLICK ANYWHERE ELSE
            ===================================== */

            closeMailnovaMonthDropdown();

            closeMailnovaSortDropdown();

        },
        true
    );

}


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


    /*
       Start global Month / Sort controller.
    */

    setupMailnovaFilterMenuController();


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


    /* All Months */

    const allOption =
        document.createElement(
            "div"
        );


    allOption.className =
        "mailnova-month-option active";


    allOption.dataset.value =
        "all";


    allOption.textContent =
        "All Months";


    dropdown.appendChild(
        allOption
    );


    /* January - December */

    months.forEach(
        (month, index) => {

            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "mailnova-month-option";


            option.dataset.value =
                `${currentYear}-${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}`;


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

            e.preventDefault();

            e.stopPropagation();


            const willOpen =
                !dropdown.classList.contains(
                    "open"
                );


            /*
               If Month is going to open,
               Sort is ALWAYS closed first.
            */

            if (willOpen) {

                closeMailnovaSortDropdown();

            }


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

            e.stopPropagation();


            const option =
                e.target.closest(
                    ".mailnova-month-option"
                );


            if (!option) {

                return;

            }


            const value =
                option.dataset.value;


            selectedMonth.textContent =
                option.textContent;


            dropdown
                .querySelectorAll(
                    ".mailnova-month-option"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


            option.classList.add(
                "active"
            );


            /*
               Selection ke baad Month
               automatically close.
            */

            closeMailnovaMonthDropdown();


            /* Store selected month */

            mailnovaFilterState.month =
                value;


            /* Apply all filters */

            applyAllMailnovaFilters();

        }
    );

}
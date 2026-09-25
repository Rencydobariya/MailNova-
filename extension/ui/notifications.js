/* =========================================================
   MAILNOVA NOTIFICATIONS
   FINAL LIVE VERSION
   - Unread notification control
   - Important unread mode
   - Notification badge
   - Live read/unread updates
   - Live Gmail sync updates
   - Settings changes
========================================================= */

(function () {

    "use strict";

    console.log(
        "MailNova Notifications Loaded 🔔"
    );


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    let refreshScheduled = false;

    let notificationInterval = null;

    let workspaceObserver = null;

    let observerAttached = false;


    /* =====================================================
       DEFAULT SETTINGS
    ===================================================== */

    const DEFAULT_NOTIFICATION_SETTINGS = {

        notificationsEnabled: true,

        importantNotifications: true,

        notificationBadge: true

    };


    /* =====================================================
       GET SETTINGS
    ===================================================== */

    function getMailnovaNotificationSettings() {

        const settings =
            typeof mailnovaSettings !==
            "undefined"
                ? mailnovaSettings
                : null;


        if (!settings) {

            return {
                ...DEFAULT_NOTIFICATION_SETTINGS
            };

        }


        /*
         * MailNova supports:
         *
         * notificationsEnabled
         *
         * and legacy:
         *
         * unreadNotifications
         */

        let notificationsEnabled =
            true;


        if (
            typeof settings.notificationsEnabled !==
            "undefined"
        ) {

            notificationsEnabled =
                settings.notificationsEnabled !==
                false;

        }

        else if (
            typeof settings.unreadNotifications !==
            "undefined"
        ) {

            notificationsEnabled =
                settings.unreadNotifications !==
                false;

        }


        return {

            notificationsEnabled,

            importantNotifications:
                settings.importantNotifications !==
                false,

            notificationBadge:
                settings.notificationBadge !==
                false

        };

    }


    /* =====================================================
       GET CURRENT EMAILS
    ===================================================== */

    function getCurrentMailnovaEmails() {

        if (
            typeof mailnovaEmails !==
            "undefined" &&
            Array.isArray(mailnovaEmails)
        ) {

            return mailnovaEmails;

        }


        return [];

    }


    /* =====================================================
       BOOLEAN HELPER
    ===================================================== */

    function isTruthyEmailValue(
        value
    ) {

        return (

            value === true ||

            value === "true" ||

            value === 1 ||

            value === "1"

        );

    }


    /* =====================================================
       CALCULATE COUNTS
    ===================================================== */

    function getMailnovaNotificationCounts() {

        const emails =
            getCurrentMailnovaEmails();


        const settings =
            getMailnovaNotificationSettings();


        let unreadCount =
            0;

        let importantUnreadCount =
            0;


        for (
            let i = 0;
            i < emails.length;
            i++
        ) {

            const email =
                emails[i];


            if (!email) {

                continue;

            }


            const unread =
                isTruthyEmailValue(
                    email.unread
                );


            if (!unread) {

                continue;

            }


            unreadCount++;


            const important =
                isTruthyEmailValue(
                    email.important
                );


            if (important) {

                importantUnreadCount++;

            }

        }


        const totalNotificationCount =
            settings.importantNotifications
                ? importantUnreadCount
                : unreadCount;


        return {

            unreadCount,

            importantUnreadCount,

            totalNotificationCount

        };

    }


    /* =====================================================
       FIND BADGES
    ===================================================== */

    function getMailnovaNotificationBadges() {

        const selectors = [

            "#mailnova-notification-badge",

            ".mailnova-notification-badge",

            "#mn-notification-badge",

            ".mn-notification-badge"

        ];


        const badges = [];


        for (
            let i = 0;
            i < selectors.length;
            i++
        ) {

            const elements =
                document.querySelectorAll(
                    selectors[i]
                );


            for (
                let j = 0;
                j < elements.length;
                j++
            ) {

                const element =
                    elements[j];


                if (
                    !badges.includes(
                        element
                    )
                ) {

                    badges.push(
                        element
                    );

                }

            }

        }


        return badges;

    }


    /* =====================================================
       HIDE BADGE
    ===================================================== */

    function hideMailnovaBadge(
        badge
    ) {

        if (!badge) {

            return;

        }


        badge.textContent =
            "";


        badge.style.display =
            "none";


        badge.setAttribute(
            "aria-hidden",
            "true"
        );


        badge.removeAttribute(
            "title"
        );

    }


    /* =====================================================
       SHOW BADGE
    ===================================================== */

    function showMailnovaBadge(
        badge,
        count,
        importantMode
    ) {

        if (!badge) {

            return;

        }


        const displayCount =
            count > 99
                ? "99+"
                : String(count);


        badge.textContent =
            displayCount;


        badge.style.display =
            "flex";


        badge.setAttribute(
            "aria-hidden",
            "false"
        );


        badge.setAttribute(
            "title",

            importantMode

                ? `${count} important unread email${count === 1 ? "" : "s"}`

                : `${count} unread email${count === 1 ? "" : "s"}`

        );

    }


    /* =====================================================
       UPDATE BADGE
    ===================================================== */

    function updateMailnovaNotificationBadge() {

        const settings =
            getMailnovaNotificationSettings();


        const badges =
            getMailnovaNotificationBadges();


        /*
         * Notifications OFF
         */

        if (
            !settings.notificationsEnabled
        ) {

            badges.forEach(
                hideMailnovaBadge
            );

            return;

        }


        /*
         * Badge OFF
         */

        if (
            !settings.notificationBadge
        ) {

            badges.forEach(
                hideMailnovaBadge
            );

            return;

        }


        const counts =
            getMailnovaNotificationCounts();


        const count =
            counts.totalNotificationCount;


        /*
         * No notifications
         */

        if (
            count <= 0
        ) {

            badges.forEach(
                hideMailnovaBadge
            );

            return;

        }


        /*
         * Show badge
         */

        badges.forEach(
            function (badge) {

                showMailnovaBadge(

                    badge,

                    count,

                    settings.importantNotifications

                );

            }
        );

    }


    /* =====================================================
       UPDATE WORKSPACE DATA
    ===================================================== */

    function updateMailnovaNotificationState() {

        const workspace =
            document.getElementById(
                "mailnova-workspace"
            );


        if (!workspace) {

            return;

        }


        const settings =
            getMailnovaNotificationSettings();


        const counts =
            getMailnovaNotificationCounts();


        workspace.dataset.notificationsEnabled =
            settings.notificationsEnabled
                ? "true"
                : "false";


        workspace.dataset.importantNotifications =
            settings.importantNotifications
                ? "true"
                : "false";


        workspace.dataset.notificationBadge =
            settings.notificationBadge
                ? "true"
                : "false";


        workspace.dataset.unreadCount =
            String(
                counts.unreadCount
            );


        workspace.dataset.importantUnreadCount =
            String(
                counts.importantUnreadCount
            );


        workspace.dataset.notificationCount =
            String(
                counts.totalNotificationCount
            );

    }


    /* =====================================================
       MAIN REFRESH
    ===================================================== */

    function refreshMailnovaNotifications() {

        try {

            updateMailnovaNotificationState();

            updateMailnovaNotificationBadge();

        }

        catch (error) {

            console.error(
                "MailNova notification error:",
                error
            );

        }

    }


    /* =====================================================
       SCHEDULE REFRESH
       Prevents duplicate refreshes
    ===================================================== */

    function scheduleMailnovaNotificationRefresh() {

        if (
            refreshScheduled
        ) {

            return;

        }


        refreshScheduled =
            true;


        const runRefresh =
            function () {

                refreshScheduled =
                    false;


                refreshMailnovaNotifications();

            };


        if (
            typeof window.requestAnimationFrame ===
            "function"
        ) {

            window.requestAnimationFrame(
                runRefresh
            );

        }

        else {

            setTimeout(
                runRefresh,
                0
            );

        }

    }


    /* =====================================================
       LIVE MAILNOVA WORKSPACE OBSERVER
       
       Watches ONLY MailNova workspace.
       
       It does NOT scan Gmail DOM.
       
       It reacts to:
       - Read -> Unread
       - Unread -> Read
       - Email card rendering
       - Gmail sync rendering
    ===================================================== */

    function attachMailnovaWorkspaceObserver() {

        if (
            observerAttached
        ) {

            return;

        }


        const workspace =
            document.getElementById(
                "mailnova-workspace"
            );


        if (!workspace) {

            return;

        }


        /*
         * Prevent duplicate observer.
         */

        if (
            workspace.__mailnovaNotificationObserver
        ) {

            observerAttached =
                true;

            workspaceObserver =
                workspace.__mailnovaNotificationObserver;

            return;

        }


        if (
            typeof MutationObserver !==
            "function"
        ) {

            return;

        }


        workspaceObserver =
            new MutationObserver(
                function (mutations) {

                    let shouldRefresh =
                        false;


                    for (
                        let i = 0;
                        i < mutations.length;
                        i++
                    ) {

                        const mutation =
                            mutations[i];


                        /*
                         * New / removed email cards
                         */

                        if (
                            mutation.type ===
                            "childList"
                        ) {

                            const target =
                                mutation.target;


                            if (
                                target &&
                                (
                                    target.closest &&
                                    (
                                        target.closest(
                                            ".mailnova-email-list"
                                        ) ||
                                        target.matches(
                                            ".mailnova-email-list"
                                        )
                                    )
                                )
                            ) {

                                shouldRefresh =
                                    true;

                                break;

                            }

                        }


                        /*
                         * Read / unread state
                         */

                        if (
                            mutation.type ===
                            "attributes"
                        ) {

                            if (
                                mutation.attributeName ===
                                    "data-unread" ||

                                mutation.attributeName ===
                                    "class"
                            ) {

                                const target =
                                    mutation.target;


                                if (
                                    target &&
                                    target.closest &&
                                    target.closest(
                                        ".mailnova-email-card"
                                    )
                                ) {

                                    shouldRefresh =
                                        true;

                                    break;

                                }

                            }

                        }

                    }


                    if (
                        shouldRefresh
                    ) {

                        scheduleMailnovaNotificationRefresh();

                    }

                }
            );


        /*
         * IMPORTANT:
         *
         * We observe only MailNova workspace.
         * Gmail itself is NOT observed.
         */

        workspaceObserver.observe(
            workspace,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "data-unread",
                    "class"
                ]
            }
        );


        workspace.__mailnovaNotificationObserver =
            workspaceObserver;


        observerAttached =
            true;


        console.log(
            "MailNova: Live notification observer attached."
        );

    }


    /* =====================================================
       WAIT FOR WORKSPACE
    ===================================================== */

    function ensureMailnovaNotificationObserver() {

        if (
            document.getElementById(
                "mailnova-workspace"
            )
        ) {

            attachMailnovaWorkspaceObserver();

            return;

        }


        /*
         * Workspace may not exist yet.
         * Try again shortly.
         */

        setTimeout(
            function () {

                attachMailnovaWorkspaceObserver();

            },
            500
        );

    }


    /* =====================================================
       PUBLIC FUNCTIONS
    ===================================================== */

    window.refreshMailnovaNotifications =
        refreshMailnovaNotifications;


    window.scheduleMailnovaNotificationRefresh =
        scheduleMailnovaNotificationRefresh;


    window.getMailnovaNotificationCounts =
        getMailnovaNotificationCounts;


    window.updateMailnovaNotificationBadge =
        updateMailnovaNotificationBadge;


    window.updateMailnovaNotificationState =
        updateMailnovaNotificationState;


    /* =====================================================
       SETTINGS CHANGE BRIDGE
    ===================================================== */

    if (
        !window.__mailnovaNotificationSettingsBridge
    ) {

        window.__mailnovaNotificationSettingsBridge =
            true;


        window.addEventListener(

            "mailnova-setting-changed",

            function (event) {

                const detail =
                    event.detail || {};


                const key =
                    detail.key;


                /*
                 * Notification settings
                 */

                if (

                    key ===
                        "notificationsEnabled" ||

                    key ===
                        "unreadNotifications" ||

                    key ===
                        "importantNotifications" ||

                    key ===
                        "notificationBadge"

                ) {

                    console.log(
                        "MailNova: Notification setting changed:",
                        key,
                        detail.value
                    );


                    scheduleMailnovaNotificationRefresh();

                }

            }

        );

    }


    /* =====================================================
       INITIAL REFRESH
    ===================================================== */

    setTimeout(

        function () {

            refreshMailnovaNotifications();

            ensureMailnovaNotificationObserver();

        },

        1000

    );


    /* =====================================================
       WORKSPACE CREATION WATCH
       
       If workspace is created after this file loads,
       attach observer automatically.
    ===================================================== */

    const workspaceCreationObserver =
        typeof MutationObserver ===
        "function"

            ? new MutationObserver(
                function () {

                    if (
                        !observerAttached &&
                        document.getElementById(
                            "mailnova-workspace"
                        )
                    ) {

                        attachMailnovaWorkspaceObserver();

                        scheduleMailnovaNotificationRefresh();

                    }

                }
            )

            : null;


    if (
        workspaceCreationObserver
    ) {

        workspaceCreationObserver.observe(

            document.body,

            {
                childList: true,
                subtree: true
            }

        );

    }


    /* =====================================================
       SAFE PERIODIC BACKUP REFRESH
       
       This is only a fallback.
       Main updates happen through the observer.
    ===================================================== */

    if (
        window.__mailnovaNotificationInterval
    ) {

        clearInterval(
            window.__mailnovaNotificationInterval
        );

    }


    notificationInterval =
        setInterval(

            function () {

                const workspace =
                    document.getElementById(
                        "mailnova-workspace"
                    );


                if (
                    workspace
                ) {

                    /*
                     * Make sure observer exists.
                     */

                    if (
                        !observerAttached
                    ) {

                        attachMailnovaWorkspaceObserver();

                    }


                    refreshMailnovaNotifications();

                }

            },

            30000

        );


    window.__mailnovaNotificationInterval =
        notificationInterval;


})();
/* =========================================================
   MAILNOVA NOTIFICATIONS
   FINAL SAFE VERSION

   Keeps:
   - Important unread count
   - Notification badge
   - Notification settings

   Removes:
   - Heavy Gmail DOM observer
   - Continuous DOM scanning
   - Recursive notification refresh
========================================================= */

(function () {

    "use strict";

    console.log(
        "MailNova Notifications Loaded 🔔"
    );


    /* =====================================================
       SETTINGS
    ===================================================== */

    function getMailnovaNotificationSettings() {

        if (
            typeof mailnovaSettings !== "undefined" &&
            mailnovaSettings
        ) {

            return {

                notificationsEnabled:
                    mailnovaSettings.unreadNotifications !== false,

                importantNotifications:
                    mailnovaSettings.importantNotifications !== false,

                notificationBadge:
                    mailnovaSettings.notificationBadge !== false

            };

        }


        return {

            notificationsEnabled: true,

            importantNotifications: true,

            notificationBadge: true

        };

    }


    /* =====================================================
       CURRENT EMAILS
    ===================================================== */

    function getCurrentMailnovaEmails() {

        if (
            typeof mailnovaEmails !== "undefined" &&
            Array.isArray(mailnovaEmails)
        ) {

            return mailnovaEmails;

        }

        return [];

    }


    /* =====================================================
       COUNT
    ===================================================== */

    function getMailnovaNotificationCounts() {

        const emails =
            getCurrentMailnovaEmails();

        const settings =
            getMailnovaNotificationSettings();


        let unreadCount = 0;

        let importantUnreadCount = 0;


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
                email.unread === true ||
                email.unread === "true" ||
                email.unread === 1;


            if (!unread) {
                continue;
            }


            unreadCount++;


            const important =
                email.important === true ||
                email.important === "true" ||
                email.important === 1;


            if (important) {

                importantUnreadCount++;

            }

        }


        return {

            unreadCount,

            importantUnreadCount,

            totalNotificationCount:
                settings.importantNotifications
                    ? importantUnreadCount
                    : unreadCount

        };

    }


    /* =====================================================
       FIND BADGE
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

                if (
                    !badges.includes(
                        elements[j]
                    )
                ) {

                    badges.push(
                        elements[j]
                    );

                }

            }

        }


        return badges;

    }


    /* =====================================================
       UPDATE BADGE
    ===================================================== */

    function updateMailnovaNotificationBadge() {

        const settings =
            getMailnovaNotificationSettings();


        const badges =
            getMailnovaNotificationBadges();


        if (
            !settings.notificationsEnabled ||
            !settings.notificationBadge
        ) {

            badges.forEach(
                badge => {

                    badge.textContent = "";

                    badge.style.display =
                        "none";

                    badge.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );

            return;

        }


        const counts =
            getMailnovaNotificationCounts();


        const count =
            counts.totalNotificationCount;


        badges.forEach(
            badge => {

                if (count <= 0) {

                    badge.textContent = "";

                    badge.style.display =
                        "none";

                    badge.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    return;

                }


                badge.textContent =
                    count > 99
                        ? "99+"
                        : String(count);


                badge.style.display =
                    "flex";


                badge.setAttribute(
                    "aria-hidden",
                    "false"
                );


                badge.setAttribute(
                    "title",
                    settings.importantNotifications
                        ? `${count} important unread email${count === 1 ? "" : "s"}`
                        : `${count} unread email${count === 1 ? "" : "s"}`
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
       PUBLIC FUNCTIONS
    ===================================================== */

    window.refreshMailnovaNotifications =
        refreshMailnovaNotifications;


    window.getMailnovaNotificationCounts =
        getMailnovaNotificationCounts;


    window.updateMailnovaNotificationBadge =
        updateMailnovaNotificationBadge;


    /* =====================================================
       SETTINGS CHANGE
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


                if (
                    detail.key ===
                        "unreadNotifications" ||

                    detail.key ===
                        "importantNotifications" ||

                    detail.key ===
                        "notificationBadge"
                ) {

                    refreshMailnovaNotifications();

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

        },
        1500
    );


    /* =====================================================
       SAFE 30 SECOND REFRESH
       
       NO MutationObserver.
       NO Gmail DOM observation.
    ===================================================== */

    if (
        window.__mailnovaNotificationInterval
    ) {

        clearInterval(
            window.__mailnovaNotificationInterval
        );

    }


    window.__mailnovaNotificationInterval =
        setInterval(
            function () {

                if (
                    document.getElementById(
                        "mailnova-workspace"
                    )
                ) {

                    refreshMailnovaNotifications();

                }

            },
            30000
        );


})();
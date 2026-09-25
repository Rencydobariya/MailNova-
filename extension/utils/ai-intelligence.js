/* =========================================
   MAILNOVA AI INTELLIGENCE

   Background AI enhancement for category,
   priority and spam + natural-language search.

   IMPORTANT PERFORMANCE DESIGN:
   - Never blocks Gmail/workspace startup.
   - Analyzes only missing AI results.
   - Sends small batches.
   - Caches results in chrome.storage.local.
   - Existing local logic remains the immediate fallback.
========================================= */

const MAILNOVA_AI_CACHE_KEY =
    "mailnova_ai_intelligence_cache";

const MAILNOVA_AI_BATCH_SIZE = 20;
const MAILNOVA_AI_MAX_PER_RUN = 100;

let mailnovaAIAnalysisRunning = false;


async function loadMailnovaAICache() {
    try {
        const saved =
            await chrome.storage.local.get(
                MAILNOVA_AI_CACHE_KEY
            );

        return saved[MAILNOVA_AI_CACHE_KEY] || {};
    }
    catch (error) {
        console.warn(
            "MailNova: AI cache load failed:",
            error
        );
        return {};
    }
}


async function saveMailnovaAICache(cache) {
    try {
        await chrome.storage.local.set({
            [MAILNOVA_AI_CACHE_KEY]: cache
        });
    }
    catch (error) {
        console.warn(
            "MailNova: AI cache save failed:",
            error
        );
    }
}


function applyMailnovaAIResult(email, result) {
    if (!email || !result) {
        return false;
    }

    const categoryDetectionEnabled =
        typeof isMailnovaCategoryDetectionEnabled ===
        "function"
            ? isMailnovaCategoryDetectionEnabled()
            : true;

    if (
        result.category &&
        categoryDetectionEnabled
    ) {
        email.category = result.category;
        email.aiCategory = result.category;
    }

    if (Number.isFinite(Number(result.priority_score))) {
        email.aiPriorityScore =
            Number(result.priority_score);
        email.aiPriority =
            Number(result.priority) || 3;
    }

    if (result.spam === true) {
        email.aiSpam = true;
    }
    else if (result.spam === false) {
        email.aiSpam = false;
    }

    email.aiSpamConfidence =
        Number(result.spam_confidence) || 0;

    email.aiSpamReason =
        result.spam_reason || "";

    email.aiPriorityReason =
        result.priority_reason || "";

    return true;
}


async function analyzeMailnovaEmailBatch(emails) {
    const response = await fetch(
        `${MAILNOVA_API}/ai/analyze-emails`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                emails: emails.map(email => ({
                    id: String(email.id || ""),
                    sender: email.sender || "",
                    subject: email.subject || "",
                    snippet: email.snippet || "",
                    body: (email.body || "").slice(0, 1200),
                    gmail_spam: Boolean(email.spam)
                }))
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `AI analysis failed: ${response.status}`
        );
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(
            data.error ||
            "AI analysis failed"
        );
    }

    return Array.isArray(data.results)
        ? data.results
        : [];
}


async function startMailnovaAIAnalysis(emails) {
    if (
        mailnovaAIAnalysisRunning ||
        !Array.isArray(emails) ||
        !emails.length
    ) {
        return;
    }

    mailnovaAIAnalysisRunning = true;

    try {
        const cache =
            await loadMailnovaAICache();

        const candidates = emails
            .filter(email => email && email.id)
            .slice(0, MAILNOVA_AI_MAX_PER_RUN)
            .filter(email => !cache[String(email.id)]);

        if (!candidates.length) {
            return;
        }

        console.log(
            "MailNova: AI intelligence analysis started:",
            candidates.length,
            "emails"
        );

        for (
            let i = 0;
            i < candidates.length;
            i += MAILNOVA_AI_BATCH_SIZE
        ) {
            const batch = candidates.slice(
                i,
                i + MAILNOVA_AI_BATCH_SIZE
            );

            try {
                const results =
                    await analyzeMailnovaEmailBatch(
                        batch
                    );

                results.forEach(result => {
                    const email = batch.find(
                        item =>
                            String(item.id) ===
                            String(result.id)
                    );

                    if (!email) {
                        return;
                    }

                    applyMailnovaAIResult(
                        email,
                        result
                    );

                    cache[String(email.id)] = result;
                });

                await saveMailnovaAICache(cache);

                if (
                    typeof applyAllMailnovaFilters ===
                    "function"
                ) {
                    applyAllMailnovaFilters();
                }
            }
            catch (error) {
                console.warn(
                    "MailNova: AI batch skipped:",
                    error
                );
            }
        }

        console.log(
            "MailNova: AI intelligence analysis completed."
        );
    }
    finally {
        mailnovaAIAnalysisRunning = false;
    }
}


async function restoreMailnovaAIResults(emails) {
    if (!Array.isArray(emails) || !emails.length) {
        return;
    }

    const cache = await loadMailnovaAICache();

    emails.forEach(email => {
        const result =
            cache[String(email?.id || "")];

        if (result) {
            applyMailnovaAIResult(
                email,
                result
            );
        }
    });
}


async function resolveMailnovaNaturalSearch(query) {
    const cleanQuery =
        String(query || "").trim();

    if (!cleanQuery) {
        return "";
    }

    const response = await fetch(
        `${MAILNOVA_API}/ai/natural-search`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: cleanQuery
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `AI search failed: ${response.status}`
        );
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(
            data.error ||
            "AI search failed"
        );
    }

    return data.query || cleanQuery;
}


window.startMailnovaAIAnalysis =
    startMailnovaAIAnalysis;

window.restoreMailnovaAIResults =
    restoreMailnovaAIResults;

window.resolveMailnovaNaturalSearch =
    resolveMailnovaNaturalSearch;

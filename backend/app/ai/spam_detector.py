"""
MailNova - Local Spam Detector

Hybrid spam detection:

1. Gmail native SPAM label = definite spam
2. High-confidence phishing/scam patterns
3. Suspicious combinations
4. Returns a boolean that the frontend uses for the SPAM badge
"""

import re


# =========================================================
# HIGH CONFIDENCE SPAM / PHISHING PATTERNS
# =========================================================

HIGH_RISK_PATTERNS = (

    # -----------------------------------------------------
    # Prize / lottery / winner scams
    # -----------------------------------------------------

    r"\b(?:you\s+have\s+won|you\s+won|you'?re\s+a\s+winner)\b",

    r"\b(?:claim|collect)\s+your\s+"
    r"(?:prize|reward|bonus|cash|gift|gift\s+card)\b",

    r"\b(?:winner|congratulations)\b.{0,100}"
    r"\b(?:prize|reward|cash|gift|lottery|jackpot)\b",

    # -----------------------------------------------------
    # Account phishing
    # -----------------------------------------------------

    r"\bverify\s+your\s+"
    r"(?:account|password|identity|email|payment|billing)\b",

    r"\bconfirm\s+your\s+"
    r"(?:account|identity|email|payment|billing)\b",

    r"\b(?:account|email|payment|billing)\s+"
    r"(?:suspended|locked|blocked|disabled)\b",

    # -----------------------------------------------------
    # Urgent phishing
    # -----------------------------------------------------

    r"\b(?:urgent|immediately|immediate|action\s+required)\b.{0,150}"
    r"\b(?:verify|confirm|login|click|update|password)\b",

    # -----------------------------------------------------
    # Dangerous links
    # -----------------------------------------------------

    r"\b(?:click|tap)\s+(?:here|the\s+link)\b.{0,150}"
    r"\b(?:claim|verify|confirm|receive|reward|prize|gift|login)\b",

    # -----------------------------------------------------
    # Money scams
    # -----------------------------------------------------

    r"\b(?:free\s+money|free\s+cash|cash\s+prize)\b",

    r"\b(?:double|triple)\s+your\s+money\b",

    r"\bguaranteed\s+(?:income|profit|returns?)\b",

    r"\b(?:crypto|bitcoin)\s+giveaway\b",

    # -----------------------------------------------------
    # Fake security alerts
    # -----------------------------------------------------

    r"\b(?:security\s+alert|security\s+warning)\b.{0,150}"
    r"\b(?:verify|confirm|login|update|click)\b",

    r"\bpassword\s+(?:expires|expired)\b.{0,150}"
    r"\b(?:login|verify|update|confirm)\b",

    # -----------------------------------------------------
    # Fake refund / payment scams
    # -----------------------------------------------------

    r"\b(?:refund|payment)\s+(?:failed|pending|blocked)\b.{0,150}"
    r"\b(?:click|verify|confirm|update)\b",
)


# =========================================================
# SUSPICIOUS PHRASES
# =========================================================

SUSPICIOUS_TERMS = {

    "winner": 1,
    "lottery": 2,
    "jackpot": 2,

    "free money": 2,
    "free cash": 2,
    "cash prize": 2,

    "gift card": 1,
    "crypto giveaway": 2,

    "double your money": 2,
    "guaranteed income": 2,
    "guaranteed profit": 2,

    "verify your account": 2,
    "verify your email": 2,
    "confirm your account": 2,

    "account suspended": 2,
    "account locked": 2,

    "security alert": 1,
    "password expires": 1,

    "urgent action required": 2,
    "click here": 1,

    "claim your reward": 2,
    "claim your prize": 2,
}


# =========================================================
# BUILD TEXT
# =========================================================

def _build_text(
    sender: str = "",
    subject: str = "",
    snippet: str = "",
    body: str = "",
) -> str:

    return " ".join(
        str(value or "")
        for value in (
            sender,
            subject,
            snippet,
            body,
        )
    ).strip().lower()


# =========================================================
# SPAM SCORE
# =========================================================

def spam_risk_score(
    sender: str = "",
    subject: str = "",
    snippet: str = "",
    body: str = "",
) -> int:

    text = _build_text(
        sender=sender,
        subject=subject,
        snippet=snippet,
        body=body,
    )

    score = 0


    # -----------------------------------------------------
    # High confidence patterns
    # -----------------------------------------------------

    matched_patterns = 0

    for pattern in HIGH_RISK_PATTERNS:

        if re.search(
            pattern,
            text,
            flags=re.IGNORECASE | re.DOTALL,
        ):

            score += 3
            matched_patterns += 1


    # -----------------------------------------------------
    # Suspicious phrases
    # -----------------------------------------------------

    for term, points in SUSPICIOUS_TERMS.items():

        if term in text:

            score += points


    # -----------------------------------------------------
    # Excessive exclamation marks
    # -----------------------------------------------------

    if text.count("!") >= 5:

        score += 1


    # -----------------------------------------------------
    # Excessive urgency
    # -----------------------------------------------------

    urgency_words = (
        "urgent",
        "immediately",
        "act now",
        "action required",
        "last chance",
    )

    urgency_count = sum(
        1
        for word in urgency_words
        if word in text
    )

    if urgency_count >= 2:

        score += 2


    return score


# =========================================================
# FINAL DECISION
# =========================================================

def is_probable_spam(
    sender: str = "",
    subject: str = "",
    snippet: str = "",
    body: str = "",
    gmail_spam: bool = False,
) -> bool:

    # =====================================================
    # Gmail native SPAM = ALWAYS SPAM
    # =====================================================

    if gmail_spam:

        print(
            "MailNova Spam Detector:",
            "Gmail native SPAM label detected",
            "| sender=",
            sender[:80],
            "| subject=",
            subject[:100],
        )

        return True


    # =====================================================
    # Local detection
    # =====================================================

    score = spam_risk_score(
        sender=sender,
        subject=subject,
        snippet=snippet,
        body=body,
    )


    # =====================================================
    # DEBUG OUTPUT
    # =====================================================

    print(
        "MailNova Spam Check:",
        f"score={score}",
        "| sender=",
        sender[:80],
        "| subject=",
        subject[:100],
    )


    # =====================================================
    # FINAL THRESHOLD
    # =====================================================

    return score >= 3
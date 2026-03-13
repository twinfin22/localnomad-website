"""
Pain Point Classification
=========================
Improved from the original reddit-pain-mining.py regex approach.

Changes from v1:
- Categories expanded beyond visa/tax/banking
- WTP signals significantly expanded (3 tiers: active buyer, seeker, passive)
- Segment hint extraction (visa type, nationality, tenure, role)
- Language-aware: separate Korean patterns for Naver blog data
- No sentiment analysis — we use platform signals (star ratings, upvotes) instead

Design note: Still regex-based for Phase 1. Phase 2 will add LLM batch
classification for accuracy on a sample, but regex gives us 80% coverage
at zero cost and instant speed.
"""

from __future__ import annotations

import re
from typing import Optional


# ── Pain Categories ──────────────────────────────────────────
# Each category has English + Korean patterns

PAIN_CATEGORIES: dict[str, re.Pattern] = {
    "visa": re.compile(
        r"visa|immigration|permit|status\s+of\s+residence|residency|overstay|extension|renewal|"
        r"sponsor|gold\s*card|ARC|alien\s+registration|비자|체류자격|체류기간|출입국|외국인등록",
        re.IGNORECASE
    ),
    "tax": re.compile(
        r"tax(?:es|ation)?|filing|double.?tax|tax.?resident|withholding|capital.?gains|"
        r"tax\s+return|연말정산|종합소득세|이중과세|세금신고|세무|원천징수",
        re.IGNORECASE
    ),
    "banking": re.compile(
        r"bank\s+account|banking|transfer|remittance|wire|credit\s+card|debit|"
        r"공동인증서|계좌개설|송금|신용카드|은행|인증서",
        re.IGNORECASE
    ),
    "housing": re.compile(
        r"apartment|housing|rent|lease|deposit|guarantor|key\s+money|landlord|real\s+estate|"
        r"jeonse|wolse|reikin|shikikin|"
        r"전세|월세|보증금|집주인|부동산|중개|임대차",
        re.IGNORECASE
    ),
    "healthcare": re.compile(
        r"health\s+insurance|medical|hospital|doctor|national\s+health|clinic|prescription|NHIS|"
        r"건강보험|병원|의료|진료|처방",
        re.IGNORECASE
    ),
    # Real-life language barrier (human communication, daily life)
    "language_barrier": re.compile(
        r"language\s+barrier|can'?t\s+(?:speak|communicate|read|understand)\s+(?:korean|japanese|chinese)|"
        r"doesn'?t\s+speak\s+english|don'?t\s+speak\s+(?:korean|the\s+language)|"
        r"interpreter|TOPIK|한국어|언어장벽|통역|"
        r"(?:hard|difficult|impossible)\s+to\s+(?:communicate|understand|read)(?:\s+(?:in\s+)?(?:korean|hangul|한글))?|"
        r"no\s+(?:korean|language)\s+(?:skill|ability)|korean\s+(?:is|was)\s+(?:hard|difficult)|"
        r"communicate\s+in\s+korean",
        re.IGNORECASE
    ),
    # App/service localization (UI translation, English version requests)
    "language_localization": re.compile(
        r"english\s+(?:version|option|support|language|interface|setting|mode|translation)|"
        r"(?:add|need|want|wish|provide|include|offer)\s+english|"
        r"(?:translate|translation)\s+(?:to|into)\s+english|"
        r"only\s+(?:in\s+)?korean|100\s*%\s*(?:in\s+)?korean|"
        r"(?:everything|all|app|interface|menu|button|text|label)\s+(?:is\s+|are\s+)?(?:in\s+)?korean|"
        r"(?:not|no)\s+(?:available\s+)?in\s+english|"
        r"for\s+foreigners.*language|language.*for\s+foreigners|"
        r"english\s+not\s+(?:available|supported)|no\s+english|"
        r"(?:google|auto|machine)\s*translat|mistranslat|"
        r"translation\s+(?:is|are)\s+(?:bad|wrong|poor|terrible|awful|inaccurate)|"
        r"english\s+please|support\s+english|make\s+it\s+(?:in\s+)?english",
        re.IGNORECASE
    ),
    "bureaucracy": re.compile(
        r"bureaucra|paperwork|government\s+office|city\s+hall|ward\s+office|"
        r"(?:at|visit|went\s+to|go\s+to)\s+immigration|immigration\s+(?:office|bureau|center)|"
        r"document|hikorea|mynumber|공인인증|정부24|주민센터|구청|민원",
        re.IGNORECASE
    ),
    "community": re.compile(
        r"lonel(?:y|iness)|isolat|friend|social\s+(?:life|circle)|community|meetup|network|"
        r"connect\s+with\s+people|expat\s+group|외로움|친구|모임",
        re.IGNORECASE
    ),
    "work_culture": re.compile(
        r"work\s+culture|office\s+(?:culture|politics)|overtime|hierarchy|boss|"
        r"drinking\s+culture|hoesik|야근|회식|직장문화|상사|갑질",
        re.IGNORECASE
    ),
    "discrimination": re.compile(
        r"discriminat|racist|racism|refused\s+because\s+foreign|foreigner\s+not\s+allowed|"
        r"gaijin|waegukin|xenophob|hate\s+speech|차별|인종|혐오|"
        r"only\s+(?:for\s+)?(?:korean\s+)?citizens|"
        r"(?:not|can'?t|unable).*(?:accessible|available|use).*(?:foreigner|foreign)|"
        r"(?:foreigner|foreign).*(?:can'?t|unable|not\s+allowed|excluded)",
        re.IGNORECASE
    ),
    "phone_connectivity": re.compile(
        r"phone\s+number|SIM\s+card|mobile\s+(?:phone|contract)|cell\s+phone|prepaid|data\s+plan|"
        r"핸드폰|유심|통신사|개통",
        re.IGNORECASE
    ),
    "work_legal": re.compile(
        r"freelanc|self.?employ|work\s+permit|illegal.*work|grey\s+area|legally\s+work|"
        r"remote\s+work.*legal|business\s+register|프리랜서|사업자등록|취업허가",
        re.IGNORECASE
    ),
    "family": re.compile(
        r"spouse\s+visa|marriage|divorce|child(?:ren)?.*school|international\s+school|"
        r"배우자\s*비자|국제결혼|이혼|자녀|학교",
        re.IGNORECASE
    ),
    "driving": re.compile(
        r"driv(?:er'?s?|ing)\s+licen[sc]e|international\s+driving|면허\s*전환|운전면허",
        re.IGNORECASE
    ),
    "cost_of_living": re.compile(
        r"expensive|cost\s+of\s+living|afford|budget|price|costly|overpriced|생활비|물가",
        re.IGNORECASE
    ),
    "mental_health": re.compile(
        r"depress(?:ion|ed)|anxi(?:ety|ous)|mental\s+health|therapy|therapist|counseling|"
        r"burnout|homesick|우울|불안|정신건강|상담",
        re.IGNORECASE
    ),
    # Generic app/service UX complaints (not foreigner-specific pain)
    # Used to explicitly tag noise so it can be filtered in analysis
    "app_ux": re.compile(
        r"(?:app\s+)?(?:crash(?:es|ing)?|bug(?:gy|s)?|glitch|freez(?:es|ing)|lag(?:gy|s)?)|"
        r"(?:slow|fast)\s+(?:loading|response|app)|"
        r"(?:update|version)\s+(?:broke|ruined|messed)|"
        r"(?:terrible|awful|horrible|worst|useless|garbage|trash)\s+(?:app|update)|"
        r"(?:uninstall|delete|remove)\s+(?:this\s+)?app|"
        r"(?:notification|notif)s?\s+(?:spam|annoying|too\s+many)|"
        r"too\s+many\s+(?:notification|notif|ad|ads|pop.?up)s?|"
        r"(?:login|sign.?in|account)\s+(?:issue|problem|error|fail)|"
        r"stars?\s+(?:until|if|when|because)|give\s+(?:it\s+)?\d\s+star",
        re.IGNORECASE
    ),
}


# ── WTP (Willingness to Pay) Signals ─────────────────────────
# Three tiers by strength of signal:
#   active_buyer:  Already spent money or actively trying to buy
#   seeker:        Looking for a service/solution
#   passive:       Expressed frustration that implies willingness

WTP_TIERS = {
    "active_buyer": re.compile(
        r"i\s+(?:paid|spent|hired|used\s+a\s+service)|"
        r"cost\s+me\s+[\$₩¥€]\s*\d|"
        r"ended\s+up\s+(?:paying|hiring)|"
        r"worth\s+every\s+(?:penny|won|yen)|"
        r"best\s+(?:money|investment)\s+i\s+(?:ever\s+)?spent|"
        r"돈\s*(?:썼|냈|들었)|맡겼|의뢰했",
        re.IGNORECASE
    ),
    "seeker": re.compile(
        r"is\s+there\s+a\s+service|"
        r"(?:anyone|somebody)\s+(?:know|recommend)\s+a?\s*(?:good|reliable)?|"
        r"how\s+much\s+(?:does|would|should)\s+it\s+cost|"
        r"where\s+(?:can|do)\s+i\s+(?:find|get|hire)|"
        r"looking\s+for\s+(?:a\s+)?(?:service|agent|lawyer|consultant)|"
        r"need\s+help\s+(?:with|finding)|"
        r"추천\s*(?:해\s*주|좀)|어디서\s*(?:찾|구)|비용이?\s*(?:얼마|어느)",
        re.IGNORECASE
    ),
    "passive": re.compile(
        r"would\s+(?:gladly\s+)?pay|willing\s+to\s+pay|"
        r"shut\s+up\s+and\s+take\s+my\s+money|"
        r"i'?d\s+pay\s+(?:good\s+)?money\s+for|"
        r"wish\s+(?:there\s+was|someone\s+would)|"
        r"if\s+only\s+(?:there\s+was|someone)|"
        r"take\s+my\s+money|"
        r"돈\s*(?:내고\s*싶|낼\s*의향)|있으면\s*좋겠",
        re.IGNORECASE
    ),
}


# ── Segment Extraction ────────────────────────────────────────

VISA_PATTERNS = re.compile(
    r"\b("
    # Korea
    r"E-[1-9]|D-[2-8]|F-[1-6]|H-1|C-4|"
    # Japan
    r"(?:digital\s+nomad|business\s+manager|engineer.?specialist|HSW|SSW[12]|"
    r"specified\s+skilled\s+worker|technical\s+intern)|"
    # Taiwan
    r"gold\s+card|APRC|(?:open\s+)?work\s+permit|employment\s+gold"
    r")\b",
    re.IGNORECASE
)

NATIONALITY_PATTERNS = re.compile(
    r"\b(?:i'?m\s+(?:from\s+|an?\s+)?|as\s+(?:a|an)\s+|being\s+(?:a|an)\s+)"
    r"(american|british|canadian|australian|indian|filipino|vietnamese|"
    r"chinese|japanese|korean|taiwanese|german|french|russian|brazilian|"
    r"indonesian|thai|malaysian|singaporean|european|asian|"
    r"미국인|영국인|캐나다인|호주인|인도인|필리핀인|베트남인)"
    r"\b",
    re.IGNORECASE
)

TENURE_PATTERNS = [
    (re.compile(r"\b(\d+)\s*\+?\s*years?\s+(?:in|living|here|been)", re.IGNORECASE), "years"),
    (re.compile(r"\b(?:lived|been|living)\s+(?:here|in\s+\w+)\s+(?:for\s+)?(\d+)\s*\+?\s*years?", re.IGNORECASE), "years"),
    (re.compile(r"\b(\d+)\s*\+?\s*months?\s+(?:in|living|here|been)", re.IGNORECASE), "months"),
    (re.compile(r"\bjust\s+(?:moved|arrived|got\s+here)", re.IGNORECASE), "just_arrived"),
]

ROLE_PATTERNS = re.compile(
    r"\b(?:i'?m\s+(?:a\s+)?|(?:as\s+)?(?:a\s+)?|work(?:ing)?\s+as\s+(?:a\s+)?)"
    r"(english\s+teacher|teacher|engineer|developer|programmer|designer|"
    r"freelancer|digital\s+nomad|nomad|student|researcher|professor|"
    r"entrepreneur|business\s+owner|translator|journalist|photographer|"
    r"영어\s*강사|교사|엔지니어|개발자|프리랜서|학생|연구원|사업자)"
    r"\b",
    re.IGNORECASE
)


# ── Public API ────────────────────────────────────────────────

def classify_categories(text: str) -> list[str]:
    """Return list of pain categories found in text."""
    return [cat for cat, pattern in PAIN_CATEGORIES.items() if pattern.search(text)]


def extract_wtp_signals(text: str) -> list[dict]:
    """
    Return list of WTP signals with tier and matched phrase.
    Example: [{"tier": "active_buyer", "match": "I paid $200"}]
    """
    signals = []
    for tier, pattern in WTP_TIERS.items():
        for match in pattern.finditer(text):
            signals.append({
                "tier": tier,
                "match": match.group(0).strip(),
            })
    return signals


def extract_segment_hints(text: str) -> dict:
    """
    Best-effort extraction of user segment info from text.
    Returns dict with whatever we can find.
    """
    hints = {}

    # Visa type
    visa_match = VISA_PATTERNS.search(text)
    if visa_match:
        hints["visa_type"] = visa_match.group(0).strip().upper()

    # Nationality
    nat_match = NATIONALITY_PATTERNS.search(text)
    if nat_match:
        hints["nationality"] = nat_match.group(1).strip().lower()

    # Tenure
    for pattern, unit in TENURE_PATTERNS:
        m = pattern.search(text)
        if m:
            if unit == "just_arrived":
                hints["tenure"] = "short"
            elif unit == "years":
                years = int(m.group(1))
                if years < 1:
                    hints["tenure"] = "short"
                elif years <= 3:
                    hints["tenure"] = "mid"
                else:
                    hints["tenure"] = "long"
            elif unit == "months":
                months = int(m.group(1))
                hints["tenure"] = "short" if months < 12 else "mid"
            break

    # Role
    role_match = ROLE_PATTERNS.search(text)
    if role_match:
        hints["role"] = role_match.group(1).strip().lower()

    return hints


def classify_record(text: str) -> dict:
    """
    Convenience function: run all classifiers at once.
    Returns dict ready to spread into PainRecord fields.
    """
    wtp_raw = extract_wtp_signals(text)
    return {
        "categories": classify_categories(text),
        "wtp_signals": [s["match"] for s in wtp_raw],
        "segment_hints": extract_segment_hints(text),
        "_wtp_tiers": [s["tier"] for s in wtp_raw],  # For analysis, not in schema
    }

# Classifier Additions: Phase D Recommendations

## New Categories to Add (5 Categories)

These should be added to your 16-category regex classifier to reduce uncategorized records from 30% to ~10-12%.

---

### 1. ADMIN_PROCEDURES
**Rationale:** 23+ Naver blogs + 15+ Reddit posts on "how do I legally [action]?"

**Trigger Keywords:**
```regex
(등록|registration|regist|notify|신고|procedure|신청|apply|申请)
.*
(사업자|business|pension|연금|insurance|보험|tax|세금|4대보험|IRP|계좌)

(외국인|foreigner|외국)
.*
(사업|business|registration|visa|퇴직|retirement)

(IRP|국민연금|정부|government|세무|tax)
.*
(외국인|foreigner)
```

**Examples (Should Match):**
- "외국인 사업자 등록 시 알아야 할 중요 사항" (Foreign business registration)
- "외국인도 국민연금 받을 수 있을까?" (Can foreigners get national pension?)
- "외국인근로자 4대보험" (Foreign worker 4 major insurance)
- "외국인해외직접투자신고" (Foreign direct investment notification)

**Examples (Should NOT Match):**
- "How to get a job in Korea" (covered by EMPLOYMENT)
- "Visa requirements for E-7" (covered by VISA)

---

### 2. DIGITAL_ACCESS
**Rationale:** 40-50 Reddit/appstore records on "account access," "app localization," "nationality verification"

**Trigger Keywords:**
```regex
(account|계정|가입|sign.*up|verify|인증)
.*
(foreigner|외국인|nationality|국적|language|한국어|korean.*only)

(app|어플|application|website|웹사이트)
.*
(cannot|can't|못|안.*|closed|access.*deny)
.*
(foreigner|외국인|english|language)

(naver|kakao|coupang|toss|shinhan|국민|우리|신한|은행)
.*
(foreigner|외국인|account|계정|language|영어)
```

**Examples (Should Match):**
- "Why do Korean websites make it so difficult for foreigners to sign up?" (e=646)
- "I dint understand its in Korean language! I choose English but its still in Korean"
- "This app only allows Korean citizens to use. Even if you have Korean ID number, it doesn't matter"
- "it will be more easier if there is translation for us foreign user"

**Examples (Should NOT Match):**
- "Language learning tips" (covered by LANGUAGE_LEARNING)
- "How to translate a document" (not about access)

---

### 3. BELONGING_IDENTITY
**Rationale:** 15-20 Reddit posts with e=100-550+ on "I don't belong," "third-culture kids," "burnout," "toxic relationship"

**Trigger Keywords:**
```regex
(belong|identity|third.*culture|cultural.*identity|alienation|異化)
.*
(foreigner|expatriate|expat|외국인)

(burnout|exhausted?|tired|toll|fatigue|심각|지쳐|힘들)
.*
(year|년|country|나라|living|생활)

(toxic.*relationship|love.*hate|cogn.*dissonance|感|矛盾)
.*
(country|나라|korea|japan|taiwan)

(belong|home|identity)
.*
(anywhere|where|어디|where)
```

**Examples (Should Match):**
- "I'm a Korean living in a foreign country, and I have the weirdest identity issues" (e=126)
- "Bye Korea (for now)" (e=251) — "finally taken a toll on me"
- "I think I'm in a toxic relationship with this country" (e=511)
- "I spent 8 years here but I don't feel at home"

**Examples (Should NOT Match):**
- "I love Korea!" (positive sentiment, no struggle)
- "Is the food good here?" (practical, not identity)

---

### 4. WORKPLACE_CULTURE
**Rationale:** 30-40 Reddit posts on "discrimination," "toxic culture," "dating rejections," "driving culture"

**Trigger Keywords:**
```regex
(culture|문화|workplace|일터|discrimination|차별|toxic|독성)
.*
(foreigner|외국인|foreigner|expatriate)

(dating|romance|relationship|연애)
.*
(reject|거절|no.*foreigner|외국인.*안)

(driving|traffic|driver|운전|manner|예의)
.*
(bad|terrible|rude|awful|toxic|한국|korea)

(work|workplace|culture|workplace.*culture)
.*
(harassment|bullying|discrimination|차별|괴롭히)
```

**Examples (Should Match):**
- "I'm tired of Korea's terrible driving manners" (e=768)
- "1st dating(?) experience in Korea" (e=117) — "romantic rejection tied to nationality"
- "Is it just me or do Korean workplace expectations exhaust foreigners?"

**Examples (Should NOT Match):**
- "How to find a job" (covered by EMPLOYMENT)
- "Office etiquette tips" (informational, not pain)

---

### 5. REMOTE_WORK_VISA
**Rationale:** n=49 bigram "digital nomad," + 15 "working remotely," + Reddit posts on E-7 + remote work conflicts

**Trigger Keywords:**
```regex
(digital.*nomad|remote.*work|remotely|work.*remotely)
.*
(visa|stay|korea|japan|taiwan)

(nomad|freelance|contractor|self.*employed)
.*
(visa|legal|tax|income|salary)

(E-7|D-10|employment.*visa)
.*
(remote|freelance|digital|nomad|working.*online)

(tax.*residency|tax.*implication|income.*korea)
.*
(remote|freelance|abroad)
```

**Examples (Should Match):**
- "As a digital nomad, which visa category should I use in Korea?" (implied in bigram data)
- "I work remotely for a US company. What visa category suits me?" (e=34+ engagement on E-7 questions)
- "Tax implications of remote work while living in Korea on D-10"

**Examples (Should NOT Match):**
- "How to find a remote job" (covered by EMPLOYMENT)
- "Digital nomad hotspots" (travel content, not pain)

---

## Integration Notes

### Priority by Impact:
1. **ADMIN_PROCEDURES** (highest ROI, existing signals are clear)
2. **DIGITAL_ACCESS** (highest user pain, immediate blockers)
3. **BELONGING_IDENTITY** (retention crisis signal, strategic importance)
4. **WORKPLACE_CULTURE** (moderate signal, complements existing WORKPLACE category)
5. **REMOTE_WORK_VISA** (emerging niche, watch signal)

### Testing Approach:
1. Run new regexes on 5,246 uncategorized records
2. Expect to capture: 150-200 records (3-4% of 5,246)
3. Re-run full classification: expect uncategorized drop from 30% → 26-28%
4. Manual review 50 records to tune false positives

### False Positive Risk:
- **ADMIN_PROCEDURES:** Low (keywords are domain-specific)
- **DIGITAL_ACCESS:** Medium (could catch unrelated "app" complaints — add negative filters for "crash," "bug," "performance")
- **BELONGING_IDENTITY:** High (emotional language overlaps with MENTAL_HEALTH, RELATIONSHIPS — use AND operator carefully)
- **WORKPLACE_CULTURE:** Medium (could catch office etiquette articles — add negative filter for "tips," "guide," "how to")
- **REMOTE_WORK_VISA:** Low (keywords are specific to nomad lifestyle)

### Regex Refinement After Testing:
- Add negative filters (NOT [word]) to reduce false positives
- Consider language (Korean, English, Japanese) detection if bilingual data is mixed
- Weight match position (title vs. body) if available

---

## Expected Outcome

**Before:** 5,246 uncategorized (30% of 17,644)
**After:** ~4,900-5,000 uncategorized (28-29%)
**Reclassified:** ~250-350 records into 5 new categories

**Remaining uncategorized:** Mostly noise (stock tips, off-topic Reddit, etc.)

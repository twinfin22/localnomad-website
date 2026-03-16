# Government Source URL Health Check Report

**Date:** March 14, 2026
**Test Method:** Python urllib with HEAD requests (no certificate verification for SSL issues)
**Sample Size:** 45 URLs across 4 regions
**Testing Location:** US-based network

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total URLs Tested** | 45 |
| **Accessible (OK)** | 19 (42.2%) |
| **Failed** | 26 (57.8%) |
| **Success by Region** | Korea 62% > SEA 73% > Japan 20% > Taiwan 9% |

**Key Finding:** Taiwan government domains have severe accessibility issues (91% failure rate), primarily due to SSL certificate errors. Japan has DNS resolution issues from non-local networks. Korea and SEA perform reasonably well for primary sources.

---

## Detailed Results by Region

### KOREA: 8/13 Working (62% Success Rate)

#### ✓ Accessible URLs (8)
- `immigration.go.kr/immigration_eng/` — Main immigration portal (English path works)
- `hikorea.go.kr` → Redirects to `https://www.hikorea.go.kr/` (HiKorea system)
- `law.go.kr` — Korean law database (root accessible)
- `e-arrivalcard.go.kr` — Electronic arrival card system
- `nts.go.kr` — National Tax Service
- `visa.go.kr` — Visa portal
- `socinet.go.kr` → Redirects to `https://www.socinet.go.kr/` (Social insurance database)
- `studyinkorea.go.kr` — Study Korea portal

#### ✗ Failed URLs (5)

| URL | Status | Error | Severity |
|-----|--------|-------|----------|
| `immigration.go.kr` | Connection Reset | Server actively rejects connection | HIGH |
| `mofa.go.kr` | Connection Reset | Server actively rejects connection | HIGH |
| `overseas.mofa.go.kr` | Connection Reset | Server actively rejects connection | HIGH |
| `law.go.kr/LSW/eng/` | 404 Not Found | URL no longer exists | MEDIUM |
| `gov.kr/portal/foreigner/` | 404 Not Found | URL no longer exists | MEDIUM |

**Observations:**
- Root `immigration.go.kr` returns connection reset, but English path works — possible DDoS protection or IP filtering
- All three `mofa.go.kr` variants fail with connection reset (Korean MFA has infrastructure issues)
- Two URLs return 404, indicating pages have moved or been deprecated

**Recommendations:**
1. Replace `mofa.go.kr` references with alternative Korean MFA sources (embassy websites, alternative portals)
2. Update all references from `immigration.go.kr` to `immigration.go.kr/immigration_eng/`
3. Remove or verify outdated `law.go.kr/LSW/eng/` and `gov.kr/portal/foreigner/` references

---

### JAPAN: 2/10 Working (20% Success Rate)

#### ✓ Accessible URLs (2)
- `isa.go.jp` → Redirects to `https://www.moj.go.jp/isa/` (Immigration Services Agency)
- `isa.go.jp/en/` → Redirects to `https://www.moj.go.jp/isa/` (English path)

#### ✗ Failed URLs (8)

| URL | Status | Error | Severity |
|-----|--------|-------|----------|
| `moj.go.jp/isa/` | DNS Failure | nodename nor servname provided | CRITICAL |
| `mofa.go.jp` | DNS Failure | nodename nor servname provided | CRITICAL |
| `mofa.go.jp/j_info/visit/visa/` | DNS Failure | nodename nor servname provided | CRITICAL |
| `japaneselawtranslation.go.jp` | DNS Failure | nodename nor servname provided | CRITICAL |
| `e-gov.go.jp` | DNS Failure | nodename nor servname provided | CRITICAL |
| `ssw.go.jp` | SSL Certificate Error | Certificate verification failed | HIGH |
| `moj.go.jp/isa/applications/status/designatedactivities53_00001.html` | DNS Failure | nodename nor servname provided | CRITICAL |
| `mofa.go.jp/ca/fna/pagewe_000001_00046.html` | DNS Failure | nodename nor servname provided | CRITICAL |

**Critical Issue:** 8 of 10 URLs fail with DNS resolution errors from US networks. This suggests:
- IP-based DNS filtering (Japan-only DNS records)
- Regional geofencing at DNS level
- These URLs may be accessible from Japan or via Japan VPN

**SSL Issue:** `ssw.go.jp` has certificate verification problems but resolves DNS correctly.

**Recommendations:**
1. **Urgent:** Test all failing URLs from Japan IP address or VPN to determine if they're region-gated
2. Use `isa.go.jp` as canonical URL (it correctly redirects to `moj.go.jp/isa/`)
3. If mofa.go.jp is inaccessible, document alternative sources (embassy websites, consulate pages)
4. For ssw.go.jp, attempt HTTPS bypass or use HTTP endpoint if available

---

### TAIWAN: 1/11 Working (9% Success Rate) — CRITICAL ISSUES

#### ✓ Accessible URLs (1)
- `coa.immigration.gov.tw/coa-frontend/four-in-one/entry/golden-card` — Gold Card Four-in-One platform

#### ✗ Failed URLs (10)

| URL | Status | Error | Severity |
|-----|--------|-------|----------|
| `immigration.gov.tw` | DNS Failure | nodename nor servname provided | CRITICAL |
| `immigration.gov.tw/7120/` | DNS Failure | nodename nor servname provided | CRITICAL |
| `boca.gov.tw` | SSL Certificate Error | Certificate verification failed | HIGH |
| `boca.gov.tw/np-137-2.html` | SSL Certificate Error | Certificate verification failed | HIGH |
| `goldcard.nat.gov.tw` | SSL Certificate Error | Certificate verification failed | HIGH |
| `en.mofa.gov.tw` | SSL Certificate Error | Certificate verification failed | HIGH |
| `law.moj.gov.tw/ENG/` | SSL Certificate Error | Certificate verification failed | HIGH |
| `law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=D0080132` | SSL Certificate Error | Certificate verification failed | HIGH |
| `digitalnomad.ndc.gov.tw` | 403 Forbidden | Server denies request | HIGH |
| `boca.gov.tw/cp-158-7718-c0382-2.html` | SSL Certificate Error | Certificate verification failed | HIGH |

**Critical Findings:**
- **91% failure rate** — Taiwan has the worst infrastructure for non-local access
- **DNS issues on main immigration portal** — `immigration.gov.tw` cannot be resolved from US
- **Widespread SSL problems** — Most .gov.tw domains have untrusted or misconfigured certificates
- **403 on digitalnomad.ndc.gov.tw** — Intentional blocking (bot protection, rate limiting, or IP filtering)

**Observations:**
- The one working URL (`coa.immigration.gov.tw`) has proper SSL and is accessible
- BOCA (Ministry of Interior) has consistent SSL issues across multiple paths
- Law Ministry (law.moj.gov.tw) both English paths fail SSL
- Taiwan MFA (en.mofa.gov.tw) has SSL issues

**Legal & Compliance Impact:**
Per project legal requirements (`legal-bright-lines.md`), Taiwan documentation must include disclaimers. If source URLs are unreliable, this strengthens the case for third-party verification and alternative sourcing.

**Recommendations:**
1. **Test from Taiwan IP/VPN** — Verify if these are region-gated or universally broken
2. **SSL Certificate Audit** — Contact Taiwan government IT to report certificate issues
3. **Alternative Sources:**
   - Use TECO (Taiwan Economic and Cultural Office) for visa information
   - Document why official sources are inaccessible
   - Provide contact info for direct inquiry
4. **digitalnomad.ndc.gov.tw 403:**
   - Test with different User-Agent headers
   - Check if this is temporary rate limiting or permanent blocking
   - May need to source information from government press releases instead

---

### SEA: 8/11 Working (73% Success Rate) — BEST REGIONAL PERFORMER

#### ✓ Accessible URLs (8)
- `nia.gov.cn` → Redirects to `https://www.nia.gov.cn/` (China NIA)
- `en.nia.gov.cn` — China NIA English site
- `thaievisa.go.th` — Thailand visa portal
- `imigrasi.go.id` — Indonesia immigration
- `evisa.imigrasi.go.id` — Indonesia e-visa
- `malaysiavisa.imi.gov.my` — Malaysia visa portal
- `ica.gov.sg` → Redirects to `https://www.ica.gov.sg/` (Singapore Immigration)
- `immigration.gov.ph` — Philippines immigration

#### ✗ Failed URLs (3)

| URL | Status | Error | Severity |
|-----|--------|-------|----------|
| `immigration.go.th` | 403 Forbidden | Server denies request | MEDIUM |
| `evisa.gov.vn` | SSL Certificate Error | Certificate verification failed | MEDIUM |
| `imi.gov.my` | DNS Failure | nodename nor servname provided | MEDIUM |

**Observations:**
- **Strong performers:** China, Indonesia (both main and e-visa), Singapore, Philippines all accessible
- **Thailand dualism:** Main immigration blocks (403), but visa portal (`thaievisa.go.th`) works
- **Vietnam:** Domain resolves but has SSL certificate issue
- **Malaysia dualism:** Main imi.gov.my doesn't resolve, but visa portal works

**Recommendations:**
1. Prioritize working URLs: China NIA, Thailand visa portal, Indonesia, Singapore, Philippines
2. For Vietnam e-visa, test from Vietnam IP or attempt SSL bypass
3. For Thailand main portal, use thaievisa.go.th as primary source
4. Investigate why Malaysia main domain doesn't resolve (potential DNS misconfiguration)

---

## Error Analysis: Root Causes

### 1. DNS Resolution Failures (10 URLs, 22% of failures)
**Affected:** Multiple Japan URLs, immigration.gov.tw, imi.gov.my

**Likely Causes:**
- IP-based DNS filtering (country-specific DNS records)
- Regional geofencing at ISP/resolver level
- Misconfigured DNS records

**Workaround:** Test from target country IP or VPN

---

### 2. SSL/TLS Certificate Errors (9 URLs, 20% of failures)
**Affected:** Most Taiwan .gov.tw domains, Japan ssw.go.jp, Vietnam evisa.gov.vn

**Likely Causes:**
- Self-signed or expired certificates
- Certificates from non-standard CAs
- Intermediate certificate chain issues
- Certificates valid only for specific subdomains

**Workaround:**
- Access via HTTP if available
- Use browsers (which have relaxed cert validation for trusted CAs)
- Test from country-specific IP

---

### 3. Connection Reset by Peer (3 URLs, 7% of failures)
**Affected:** immigration.go.kr (root), mofa.go.kr variants

**Likely Causes:**
- DDoS protection / rate limiting
- IP-based blocking (bot detection)
- Firewall rules rejecting non-standard requests
- Server actively refusing connections

**Workaround:**
- Test with different User-Agent
- Test from different IP (residential proxy)
- Contact server administrators

---

### 4. HTTP 403 Forbidden (2 URLs, 4% of failures)
**Affected:** immigration.go.th, digitalnomad.ndc.gov.tw

**Likely Causes:**
- Bot protection / scraping prevention
- Rate limiting triggered
- IP-based access control
- Geographic restrictions

**Workaround:**
- Use proper User-Agent header
- Reduce request frequency
- Test from country-specific IP

---

### 5. HTTP 404 Not Found (2 URLs, 4% of failures)
**Affected:** law.go.kr/LSW/eng/, gov.kr/portal/foreigner/

**Cause:** URLs no longer exist or have been moved

**Workaround:** Find replacement URLs or verify if pages have been deprecated

---

## Summary by Error Type

| Error Type | Count | % of Total | Severity | Workaround Difficulty |
|------------|-------|-----------|----------|----------------------|
| DNS Failure | 10 | 22% | HIGH | Hard (requires VPN/country IP) |
| SSL Certificate | 9 | 20% | MEDIUM | Medium (browser access possible) |
| Connection Reset | 3 | 7% | HIGH | Hard (may require proxy) |
| 403 Forbidden | 2 | 4% | MEDIUM | Medium (may work with changes) |
| 404 Not Found | 2 | 4% | HIGH | Hard (pages don't exist) |

---

## Impact Assessment for Documentation

### High Priority Fixes
1. **Taiwan DNS issues** — Primary immigration portal unreachable. Requires immediate investigation and alternative sourcing.
2. **Japanese DNS issues** — 80% of Japan sources fail DNS. Test from Japan to verify feasibility.
3. **Korean MOFA** — All Korean MFA sources fail. Find alternative official sources.

### Medium Priority Fixes
1. **Taiwan SSL certificates** — Most accessible after DNS, but needs cert verification bypass in docs
2. **Missing 404 URLs** — Remove references to law.go.kr/LSW/eng/ and gov.kr/portal/foreigner/
3. **Vietnam & Thailand** — Test from country IPs; may be temporary issues

### Documentation Recommendations
1. **Add disclaimer:** "Government source accessibility varies by region and network. If you cannot access a source, contact the relevant embassy or consulate."
2. **Provide TECO/embassy alternatives:** For hard-to-reach Taiwan sources, offer TECO contact info.
3. **Version source URLs:** Document last-verified date for each source to track infrastructure changes.
4. **SSL note:** "Some government websites may show certificate warnings. These are typically infrastructure issues, not security threats."

---

## Files Affected in Repository

**No files modified.** This is research-only output.

**Where to apply findings:**
- Source references in: `content/blog/`, visa guide pages, comparison tables
- Government source links in: `lib/blog/schema.ts`, visa data JSON files
- Disclaimer text in: Legal pages, Taiwan-specific disclaimers

---

## Testing Methodology Notes

- **Tool:** Python `urllib.request` with 10-second timeout
- **Request Method:** HEAD (faster, doesn't download full page)
- **User-Agent:** Mozilla/5.0 (mimics browser)
- **SSL Verification:** System default (will catch certificate errors)
- **Redirects:** Followed (reports final URL after redirect chain)
- **Rate Limiting:** 0.3-0.5 second delay between requests to avoid triggering rate limits

### Limitations
- **Network dependency:** Results are specific to US-based network. Regional DNS/IP filtering may differ from actual user locations.
- **SSL bypasses:** Browser access (which relaxes cert validation) may succeed where urllib fails.
- **Bot detection:** Some sites may have improved bot detection since test run.
- **Transient failures:** Some 403/timeout errors may be temporary.

---

## Recommendations for Future Testing

1. **Regional testing:** Repeat tests from Japan, Taiwan, Korea IPs using VPN services
2. **Browser testing:** Use Selenium or Playwright to test in actual browsers (bypasses some SSL/bot issues)
3. **Certificate inspection:** Run `openssl s_client` to diagnose SSL issues
4. **DNS testing:** Use `nslookup` / `dig` to diagnose regional DNS issues
5. **Rate limit testing:** Space requests further apart (5-10 seconds) and retry failed URLs
6. **User-Agent rotation:** Test with multiple User-Agent strings to diagnose 403 blocking

---

**Report Generated:** 2026-03-14 04:47 UTC
**Test Duration:** ~82 seconds (45 URLs + delays)
**Data Scientist:** Claude (Haiku 4.5)

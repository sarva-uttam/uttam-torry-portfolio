# Security control matrix

Last reviewed: 2026-09-04. Architecture: **static site on GitHub Pages, no backend.**

Legend for **Applicable?**
- **Implemented** — added in this pass.
- **Already protected** — provided by the platform / already true.
- **N/A** — no component exists for this control to apply to.
- **Hosting config** — recommended, but only possible with a header-capable host or a repo-settings change the owner must make.
- **Blocked** — needs an explicit owner decision.

| Area | Applicable? | Existing control | Implemented change | Verification | Residual risk |
|------|-------------|------------------|--------------------|--------------|---------------|
| HTTPS / TLS | Already protected | GitHub Pages forces HTTPS (`https_enforced: true`) | none needed | `curl -sI` shows redirect to HTTPS; `Strict-Transport-Security` present | `*.github.io` HSTS has no `preload`; low risk (parent domain is preloaded) |
| HSTS | Already protected | `Strict-Transport-Security: max-age=31556952` sent by GitHub Pages | none | `curl -sI` on live site | Cannot add `includeSubDomains; preload` without a custom domain + header host |
| Content Security Policy | Implemented | none | `<meta http-equiv="Content-Security-Policy">` on all 3 pages: `default-src 'self'; base-uri 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-src 'none'; object-src 'none'; manifest-src 'self'; upgrade-insecure-requests` | Playwright: 0 CSP violations on all 3 pages; fonts still apply; JSON-LD still parses | `<meta>` CSP cannot express `frame-ancestors` / `sandbox`; `style-src` keeps `'unsafe-inline'` (no style injection sink exists) |
| `script-src` hardening | Implemented | inline `<head>` routing script (needed `'unsafe-inline'`) | extracted to same-origin **`route.js`**; `script-src 'self'` now works with **no** `unsafe-inline` / `unsafe-eval` | Playwright: `document.querySelectorAll('script:not([src])').length === 0` on index/m; routing still redirects correctly with hash preserved | none material |
| `X-Content-Type-Options: nosniff` | Hosting config | not sent; **cannot** be set via `<meta>` | documented | `curl -sI` — header absent | MIME-sniffing of a mistyped asset. Low (all assets are correctly typed by GitHub Pages). Fix: header-capable host / Cloudflare. |
| Referrer-Policy | Implemented | browser default only | `<meta name="referrer" content="strict-origin-when-cross-origin">` on all pages + `rel="noopener noreferrer"` on all 43 external links | Playwright: meta present; `grep` shows 43/43 links carry `noreferrer` | none |
| Permissions-Policy | Hosting config | not sent; no `<meta>` equivalent | documented; recommended value below | n/a | Third-party/embedded code could use camera/geolocation/etc. APIs. Very low (no third-party scripts, no embeds). |
| Frame protection / clickjacking | Hosting config | none (`X-Frame-Options` and CSP `frame-ancestors` both unavailable here) | documented | page can currently be framed | Low: the site has no sensitive click targets; worst case is a framed copy used for phishing dressing. Fix: `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'` as a real header. |
| Cross-Origin isolation (COOP/COEP/CORP) | Hosting config | GitHub Pages sends `Access-Control-Allow-Origin: *` on assets | documented | `curl -sI` | Any site can `fetch()` these public pages — acceptable, the content is public and carries no credentials. |
| Subresource Integrity (SRI) | Hosting config / Blocked | Google Fonts `<link>` has no SRI | not added — Google Fonts serves **per-browser CSS**, so a fixed hash breaks it | n/a | A compromised Google Fonts could serve malicious CSS. Real fix: **self-host the fonts** (all 4 families are OFL-licensed) and drop the `fonts.*` origins from CSP entirely. Recommended; owner decision (adds ~250 KB of `woff2`). |
| Minimal third-party scripts | Already protected | zero third-party **scripts**; only Google Fonts **CSS/fonts** | none | `grep` for external `<script>` — none | see SRI row |
| External link safety | Implemented | `rel="noopener"` on all `target="_blank"` | upgraded to `rel="noopener noreferrer"` (adds referrer privacy) | `grep -c 'noopener noreferrer'` = 43; bare `noopener` = 0 | none |
| Cookies | N/A | no cookies set anywhere | — | `grep` for `document.cookie` / `Set-Cookie` — none | — |
| CSRF protection | N/A | no cookie-authenticated state-changing requests | — | — | — |
| Input validation (server) | N/A | no server input | — | — | — |
| Client input handling | Implemented | `route.js` read a raw `localStorage` value | added allow-list validation (`"mobile"`/`"desktop"` only) on **both** read (`route.js`) and write (`script.js` `initViewSwitch`) | code review; Playwright: poisoned value ignored | none |
| Output encoding | Already protected | all dynamic DOM writes use `textContent` / `classList` / `style` — never `innerHTML` | none | manual review of `script.js` | a future contributor could introduce `innerHTML` — mitigated by CSP + review |
| Parameterised DB queries | N/A | no database | — | — | — |
| File-upload validation | N/A | no upload capability | — | — | — |
| Open redirect | Already protected | `route.js` redirect targets are **fixed string literals** (`"m.html"` / `"index.html"`); only `location.hash` is appended | none | code review + Playwright: `m.html#about` → `index.html#about`, no cross-origin possible | none |
| Safe error responses | Already protected | static hosting; GitHub Pages 404 page carries no stack/diagnostics | none | browse a missing path | none |
| Version / tech disclosure | Already protected | responses show only `Server: GitHub.com`; no app framework banner | none | `curl -sI` | none |
| Rate limiting | N/A | no backend / API / auth / billable endpoint to rate-limit | — | — | Bandwidth-exhaustion is the only abuse vector — see DoS row |
| Usage quotas | N/A | no authenticated or metered feature | — | — | — |
| Request throttling (server) | N/A | no server | — | — | — |
| CAPTCHA | N/A | contact is `mailto:` only; no submitted form | — | — | — |
| Cost controls | N/A | no billable feature; Google Fonts is free/unmetered; no AI; no payments | — | — | — |
| Denial of service | Hosting config | GitHub Pages CDN + soft ~100 GB/month bandwidth limit | documented | — | Sustained scripted downloads could exhaust the monthly allowance → site suspended until reset. Fix: **Cloudflare (free) in front** for cache + rate limiting; or accept (personal site, low target value). |
| Secrets in repo / history | Already protected | none present | verified via full-history `git log -p` secret-pattern scan (0 hits); no `package.json`/`.env`/keys; broadened `.gitignore` | scan output | — |
| Secret scanning (GitHub) | Already protected / Hosting config | secret scanning **ON**, push protection **ON** | documented recommendation to also enable *non-provider patterns* + *validity checks* | `gh api .../security_and_analysis` | Generic-format tokens (e.g. the local Semgrep JWT) aren't caught until non-provider patterns are on |
| Dependency audit | N/A (app) / Implemented (CI) | no app deps | added `.github/dependabot.yml` for the `github-actions` ecosystem, weekly | file present; Dependabot will open PRs | — |
| GitHub Actions permissions | Implemented | job had `contents/pages/id-token`; repo default token is `read` | added top-level `permissions: {}`; kept job perms minimal & commented; `persist-credentials: false` on checkout | workflow file review | Repo setting `allowed_actions: all` and `sha_pinning_required: false` — see hosting-config recommendations |
| Pinned action versions | Implemented | actions were floating tags (`@v4`) | all 4 `actions/*` pinned to **commit SHA** with a `# vX.Y.Z` comment | workflow file review; SHAs resolved from upstream tags | Dependabot proposes future bumps for owner review |
| Untrusted PR code + secrets | Already protected | deploy runs on `push` to `master` only; **no** `pull_request` trigger | none | workflow `on:` block | A malicious PR cannot reach `GITHUB_TOKEN`/environment |
| Static security analysis | Partially | `.semgrep/` config exists locally (not committed) | manual review done (no dangerous sinks); **recommend** adding a Semgrep or CodeQL CI job | manual review notes in threat model | Automated JS scanning not yet in CI |
| Build / test gates | N/A | no build step, no test suite (vanilla static files) | documented; deploy is the only pipeline | — | No automated pre-deploy check beyond the Pages artifact build |
| Privacy — PII on site | Implemented (site) / Open (PDF) | full home address in footer of 3 pages + in CV PDF | footer address on `index.html` / `faq.html` / `m.html` replaced with region-only plain text `Rivière du Rempart, Mauritius` (no Google Maps link) | `grep` — no `Reservoir`/`Roche Terre` in HTML; Playwright renders `Rivière du Rempart, Mauritius`, not a link | The street address is **still inside `assets/Uttam-Torry-CV-2026.pdf`** (downloadable) until the owner re-exports it — see residual R1 |
| PDF metadata | Already protected | `Uttam-Torry-CV-2026.pdf` — Author/Title stripped (`anonymous` / `untitled`), no XMP | none | `pdfinfo` output | The address is in the **visible CV body** (not metadata) — owner re-export needed |
| Real response headers (`_headers` file) | Implemented (for capable hosts) | none | `_headers` at repo root: full CSP incl. `frame-ancestors 'none'`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP, HSTS, plus `Cache-Control` for `/assets/*` | honoured by Tiiny Host (paid), Netlify, Cloudflare Pages; **GitHub Pages ignores it** | On GitHub Pages the `<meta>` CSP + `<meta>` referrer stay the only enforced headers |

## Recommended real response headers (for a header-capable host / Cloudflare)

If the site ever moves behind Cloudflare (free) or to Netlify/Vercel/Cloudflare
Pages, add these as **real headers** (a `_headers` file or a Cloudflare Transform
Rule). This closes the "Hosting config" rows above.

```
Content-Security-Policy: default-src 'self'; base-uri 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

(Keep the `<meta>` CSP too — it is harmless alongside the header and still
protects if the site is ever opened from `file://` or a different host.)

## Recommended GitHub repository settings (owner action)

- **Branch protection** on `master`: block force-push, block deletion. Optional: require the "Deploy static site" run to succeed.
- **Actions → General**: set *Allowed actions* to "Actions created by GitHub" + selected; enable *Require actions to be pinned to a full-length commit SHA*.
- **Code security**: enable *Dependabot alerts* and *Dependabot security updates*; under *Secret scanning* enable *non-provider patterns* and *validity checks*.
- Optional: add CodeQL (JavaScript) — low value for ~600 lines of dependency-free JS with no dangerous sinks, but cheap.

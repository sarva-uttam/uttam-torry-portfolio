# Threat model — Uttam Torry portfolio

Method: lightweight STRIDE-style pass over assets, trust boundaries, entry points,
threats and mitigations, aligned to OWASP Top 10 (2021) and OWASP ASVS L1.
Last reviewed: 2026-09-04.

## 1. System description

A static website. The browser downloads HTML/CSS/JS/images from GitHub Pages and
runs the JS locally. There is no origin server that executes our code, no
datastore, no user accounts.

```
[ Visitor browser ]
   │  HTTPS GET (static files only)
   ▼
[ GitHub Pages CDN (Fastly) ]  ◄── artifact ── [ GitHub Actions: deploy-pages ]
                                                     ▲
                                                     │ push to master
                                          [ Repo: sarva-uttam/PORTFOLIO ]
                                                     ▲
                                                     │ commits
                                          [ Owner's laptop + GitHub account ]

Runtime third parties:  Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
Outbound links:         github.com, linkedin.com, facebook.com, pinterest.com, reddit.com,
                        google.com/maps, mailto:uttamtorry@gmail.com
Client storage:         localStorage key "siteView" (UI preference: "mobile" | "desktop")
```

## 2. Assets

| # | Asset | Why it matters |
|---|-------|----------------|
| A1 | Integrity of the served site (HTML/CSS/JS) | Defacement or injected script would be shown to recruiters; reputational |
| A2 | The owner's GitHub account & repo write access | Controls what gets published |
| A3 | GitHub Actions deploy pipeline & `GITHUB_TOKEN` | Can publish arbitrary content if abused |
| A4 | Owner's personal data shown on the site | Email, LinkedIn, **full home address**, CV PDF — privacy / physical safety |
| A5 | Visitor privacy | Referrer / IP leakage to third parties while browsing |
| A6 | GitHub Pages bandwidth allowance (~100 GB / month soft limit) | Exhaustion → site suspended for the month |
| A7 | Local dev machine secrets (e.g. Semgrep OAuth token in `.semgrep/`) | Not in repo, but present in a cloud-synced folder |

## 3. Trust boundaries

- **TB1** Visitor browser ↔ GitHub Pages CDN (public, untrusted network).
- **TB2** GitHub Pages ↔ Google Fonts (third-party origin loaded at runtime).
- **TB3** Owner laptop / GitHub account ↔ repository (the only write path to A1).
- **TB4** Repository ↔ GitHub Actions runner ↔ Pages (the publish path).
- **TB5** Visitor browser ↔ outbound link targets / `mailto:`.

## 4. Entry points

| Entry point | Server-side? | Notes |
|-------------|-------------|-------|
| `GET /`, `/faq.html`, `/m.html`, static assets | No | Plain file serving by GitHub Pages |
| URL query string (`?mobile=1`, `?desktop=1`, `?full=1`) | No | Read by `route.js` in the browser; only ever stored as the literal `"mobile"`/`"desktop"` |
| URL fragment (`#about`, …) | No | Used for in-page scroll and carried across the mobile/desktop redirect |
| `localStorage["siteView"]` | No | Validated against an allow-list on read and write |
| `git push` to `master` | Yes (CI) | Triggers the deploy workflow |
| Pull requests | Yes (CI) | No workflow runs on PR; deploy is `push` to `master` only |

There are **no** form POSTs, no API routes, no webhooks, no upload endpoints.

## 5. Threats and mitigations (mapped to the requested priority list)

| Pri | Threat | Applicable here? | Mitigation / status |
|-----|--------|------------------|---------------------|
| 1 | **Account compromise** (A2/A3) | Yes | Owner-controlled: strong password + 2FA on GitHub, minimal repo collaborators. Repo: secret-scanning push protection ON. **Recommend**: branch protection on `master`, restrict Actions to GitHub-owned + selected. Residual: phishing of the owner's GitHub account. |
| 2 | **Injection** (SQL/command/template) | No | No server, no interpreter, no datastore. `route.js`/`script.js` never build code or queries from input. **N/A.** |
| 3 | **XSS** | Low | No user-generated content, no `innerHTML`/`document.write`/`eval`, no inline event handlers. Defence-in-depth: strict `<meta>` CSP (`script-src 'self'`). Residual: a future contributor adds an unsafe DOM sink — mitigated by CSP + code review. |
| 4 | **CSRF** | No | No cookies, no authenticated state-changing requests. **N/A.** |
| 5 | **Broken access control** | No | Nothing is access-controlled; all content is intentionally public. **N/A.** |
| 6 | **API abuse** | No | No API. **N/A.** |
| 7 | **Automated spam** | No | No form, no comment box, no submission of any kind. Contact is `mailto:` only (spam risk is on the owner's mailbox, handled by Gmail filters). **N/A** for the site. |
| 8 | **Secret exposure** | Yes | No secret is needed or present in the repo/history (verified). Secret scanning + push protection ON. Local `.semgrep/` token is git-ignored but sits in a OneDrive-synced folder — see residual R7. |
| 9 | **Dependency / supply-chain compromise** | Low | No application dependencies. Runtime: Google Fonts CSS/font files (see TB2). CI: 4 first-party `actions/*` now pinned to commit SHAs; Dependabot watches them. Residual: compromise of Google Fonts or of an `actions/*` repo. |
| 10 | **Denial of service** | Low | Static CDN absorbs normal load. Realistic vector: sustained scripted downloads of the 300 hero frames (~5 MB/run) to burn the GitHub Pages 100 GB/month allowance → month-long suspension. Mitigation today: none at the platform. **Recommend**: front with Cloudflare (free) for caching + rate limiting. |
| 11 | **Unexpected third-party cost** | No | No billable third-party call anywhere. Google Fonts is free and unmetered. **N/A.** |
| 12 | **Privacy / PII exposure** | High → Low | The footer of all three pages **used to** publish a full residential street address; it now shows region only (`Rivière du Rempart, Mauritius`, no map link). The street address is still inside the downloadable CV PDF until the owner re-exports it. Email + public social profiles are owner-approved. See finding V-1 and residual R1. |
| 13 | **Misconfiguration** | Medium | GitHub Pages sends HSTS + HTTPS but not `X-Content-Type-Options`, `Permissions-Policy` or `X-Frame-Options`, and it cannot be configured to. CSP `frame-ancestors` is ignored in `<meta>`. Documented; needs a header-capable host to fully fix. |
| 14 | **Supply-chain / deployment risk** | Medium→Low | `deploy-pages.yml` hardened: `permissions: {}` at top, minimal job permissions, SHA-pinned actions, `persist-credentials: false`, environment-gated. Residual: no branch protection, so a compromised owner session can push straight to `master`. |

## 6. Out of scope

- Security of third-party destination sites (LinkedIn, GitHub, etc.).
- The contents of the owner's Gmail / social accounts.
- The owner's local machine beyond flagging the OneDrive-synced token file.
- Physical security of the address disclosed on the site (flagged as a finding, decision is the owner's).

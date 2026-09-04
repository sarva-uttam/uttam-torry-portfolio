# Security Policy

## Scope

This repository is the source for a **static personal portfolio website**
(`index.html`, `faq.html`, `m.html`, `styles.css`, `script.js`, `route.js` and
image/PDF assets) published with GitHub Pages at
<https://sarva-uttam.github.io/PORTFOLIO/>.

There is **no backend, database, authentication, session, cookie, form
submission, file upload or payment flow.** The site is HTML, CSS and
client-side JavaScript served as static files. This shapes everything below: most
classic web-app controls (rate limiting, quotas, CAPTCHA, CSRF tokens, server
authorization, injection defence) have **no server to apply to** and are recorded
as *Not Applicable* — see [`docs/security/control-matrix.md`](docs/security/control-matrix.md).

We do **not** claim the site is "unhackable" or free of vulnerabilities. The goal
is proportionate risk reduction, early detection, and honest documentation of
residual risk.

## Reporting a vulnerability

If you find a security problem:

1. **Do not** open a public issue with exploit details.
2. Email **uttamtorry@gmail.com** with subject `SECURITY` and include:
   - what you found and where (URL / file / line),
   - how to reproduce it,
   - the impact you believe it has.
3. You will get an acknowledgement within **7 days**.

Please do **not**: run denial-of-service or load tests against the live site,
attempt credential attacks, run automated scanners against the hosted site, or
access data that is not yours. Testing against a local copy of this repository is
fine and encouraged.

There is no bug-bounty programme. Good-faith reports are welcomed and credited if
you wish.

## Supported versions

Only the current `master` branch / live deployment is supported. There are no
release branches.

## What is protected, and how

| Area | Summary |
|------|---------|
| Transport | HTTPS enforced by GitHub Pages; HSTS sent by GitHub Pages |
| Content Security Policy | `<meta>` CSP on every page: `script-src 'self'`, no `unsafe-eval`, locked to self + Google Fonts |
| Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin` + `rel="noopener noreferrer"` on every external link |
| Tab-nabbing | every `target="_blank"` link carries `rel="noopener noreferrer"` |
| Secrets | none in the repo or its history; secret scanning + push protection enabled; broadened `.gitignore` |
| Supply chain | no npm/pip/gem dependencies; GitHub Actions pinned to commit SHAs; Dependabot watches the workflow |
| Deployment | least-privilege `GITHUB_TOKEN`, `persist-credentials: false`, environment-gated Pages deploy |

Full detail, including controls that require hosting-level configuration and the
residual-risk register, is in [`docs/security/`](docs/security/).

## Review schedule

- **Monthly:** review Dependabot PRs; skim GitHub Security tab (secret scanning, code scanning).
- **Quarterly:** re-run the checks in [`docs/security/deployment-checklist.md`](docs/security/deployment-checklist.md); re-read the residual-risk register.
- **On any change to `script.js` / `route.js` / third-party resources:** re-check the CSP and re-run the verification steps.
- **On any move to a new host or a custom domain:** implement the real response headers listed in the control matrix.

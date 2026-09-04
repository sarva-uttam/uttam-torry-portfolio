# Deployment / release security checklist

Run through this before merging to `master` (which auto-deploys) and once per
quarter as a spot check. It's short on purpose.

## Every change

- [ ] `git status` is clean of stray files; no `.env`, key, token, `.semgrep/`, screenshot or `node_modules` staged.
- [ ] `git diff --staged` reviewed line by line — no secret, no personal data beyond what's already approved, no debug code.
- [ ] No new `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` / `eval` / `new Function` in JS.
- [ ] No new inline `<script>` (put JS in a `.js` file so `script-src 'self'` keeps working). No inline `on*=` handlers.
- [ ] Any new external resource (script, style, font, image, connect) is added to the `<meta>` CSP on **all three** HTML files **and** to the CSP line in `/_headers`. Keep the two in sync (the only intended difference is `frame-ancestors 'none'`, which only the header can express).
- [ ] Any new `target="_blank"` link has `rel="noopener noreferrer"`.
- [ ] New GitHub Actions are pinned to a full commit SHA with a `# vX.Y.Z` comment; workflow permissions stay minimal.

## Verify locally (static server + browser)

```
python -m http.server 8000
```

- [ ] Open `index.html`, `faq.html`, `m.html` — **0** errors/warnings in the browser console (watch for `Content Security Policy` violations).
- [ ] Fonts render (Anton headline, JetBrains Mono body).
- [ ] Device routing still works: `m.html` on desktop → `index.html`; `?mobile=1` / `?desktop=1` honoured; hash preserved.
- [ ] FAQ JSON-LD still `JSON.parse`s and matches the visible Q&A.
- [ ] All internal links / assets return 200.
- [ ] No horizontal scrollbar at 360 / 768 / 1280 / 1920 px.

## Verify on the live site (after deploy)

- [ ] `curl -sI <live-url>` shows HTTPS + `Strict-Transport-Security`.
- [ ] View source: CSP `<meta>` and `referrer` `<meta>` present on all three pages.
- [ ] **GitHub Pages:** the Actions run that deployed was triggered by your push from `master` and succeeded.
- [ ] **Tiiny Host / Netlify / Cloudflare Pages:** `curl -sI <live-url>` also shows `content-security-policy`, `x-content-type-options`, `x-frame-options`, `permissions-policy` (from `/_headers`). If they are absent, the plan does not honour `_headers` — the `<meta>` CSP is still active.
- [ ] Optional: paste the CSP into <https://csp-evaluator.withgoogle.com/> and confirm no regression.

## Quarterly

- [ ] Review and merge/close Dependabot PRs for `github-actions`.
- [ ] GitHub → Security tab: no open secret-scanning or code-scanning alerts.
- [ ] Re-read `residual-risks.md`; update status where the world changed.
- [ ] Confirm repo settings still match `control-matrix.md` → "Recommended GitHub repository settings".
- [ ] If a custom domain or new host was added: implement the real response headers.

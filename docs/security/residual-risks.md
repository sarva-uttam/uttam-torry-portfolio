# Residual-risk register

Last reviewed: 2026-09-04. Severity = realistic impact × likelihood for *this*
static personal site. "Owner action" means it cannot be fixed in code.

| ID | Risk | Severity | Status | Recommended action |
|----|------|----------|--------|--------------------|
| **R1** | **Full residential address published** on `index.html`, `faq.html`, `m.html` (footer) and inside `assets/Uttam-Torry-CV-2026.pdf`, with a Google Maps deep-link. Enables doxxing / physical-safety risk and social-engineering ("I saw you live at …"). | **High** | **Blocked — owner decision** | Replace the street address with region only. Minimum safer alternative: `Rivière du Rempart, Mauritius` (or just `Mauritius — open to relocation`) and drop the Maps link. Re-export the CV PDF the same way. Recruiters do not need a house number. A ready-to-apply diff is in the appendix below. |
| **R2** | **No hosting-level response headers.** GitHub Pages cannot send `X-Content-Type-Options`, `Permissions-Policy`, `X-Frame-Options`; `<meta>` CSP cannot express `frame-ancestors`. Site can be framed; MIME-sniff protection relies on GitHub typing assets correctly. | Medium | Open — needs a header-capable host | Put Cloudflare (free) in front of the `github.io` site, or move to Cloudflare Pages / Netlify / Vercel, and add the header set in `control-matrix.md`. Also enables edge caching (helps R5). |
| **R3** | **No branch protection on `master`.** A compromised owner GitHub session can push straight to production; force-push/history-rewrite is possible. | Medium | Open — owner action | Enable branch protection: block force-push + deletion; optionally require the deploy workflow to pass. Keep 2FA on the GitHub account. |
| **R4** | **Supply chain: Google Fonts.** Runtime dependency on `fonts.googleapis.com` / `fonts.gstatic.com`. A compromise there could serve malicious CSS; Google also sees each visitor's IP + referrer. | Low–Medium | Open — owner decision | Self-host the four families (all OFL-licensed): download `woff2`, add a local `@font-face` block, remove the two `fonts.*` origins from CSP and the `<link>`/`preconnect`. ~250 KB added to the repo; removes a whole trust boundary and a GDPR-flavoured privacy issue. |
| **R5** | **Bandwidth-exhaustion DoS.** Scripted repeated downloads of the ~5 MB hero-frame set could trip the GitHub Pages ~100 GB/month soft limit and suspend the site until reset. No data or money at risk. | Low | Accepted (or fix via R2) | Cloudflare edge caching makes this impractical. Otherwise accept — self-heals monthly. |
| **R6** | **Actions supply chain (residual).** Four first-party `actions/*` are now SHA-pinned, but a compromise of an `actions/*` repo at a pinned SHA, or of the GitHub Actions runner platform, is still possible. | Low | Mitigated as far as practical | Dependabot surfaces bumps; owner reviews each. Repo setting *require SHA pinning* adds enforcement. |
| **R7** | **Local Semgrep OAuth token** in `.semgrep/guardian.yml` on the owner's machine. **Not committed** (git-ignored, never in history) but the repo lives in a **OneDrive-synced folder**, so the file is uploaded to Microsoft's cloud and any linked devices. Scope: Semgrep account/org identity (`b-b-org`), not code-exec or billing. | Low | Open — owner action | Rotate it (`semgrep logout` then re-auth, or revoke the token in Semgrep settings) **and** either move the working copy out of OneDrive or exclude `.semgrep/` from OneDrive sync. Do this without waiting — do not rely on it expiring. |
| **R8** | **Client-side XSS via a future contributor.** Today there is no sink; a later change adding `innerHTML`/`insertAdjacentHTML` from any external string would reintroduce risk. | Low | Mitigated (defence in depth) | CSP `script-src 'self'` blocks injected inline/remote script execution; code review; keep the "no `innerHTML`" rule. |
| **R9** | **Third-party outbound-link risk.** Links to LinkedIn/GitHub/Facebook/Pinterest/Reddit/Google Maps — those destinations' security is outside our control. | Low | Accepted | `rel="noopener noreferrer"` limits tab-nabbing + referrer leakage. |
| **R10** | **`.claude/launch.json` tracked in the repo** — runs `npx --yes serve` for local preview (auto-installs an unpinned npm package on the owner's machine at dev time; never in CI or prod). | Info | Accepted | Optional: use `python -m http.server` (already the documented method) and drop `.claude/` from the repo. No production impact. |

## Appendix — prepared diff for R1 (apply only with owner approval)

In `index.html`, `faq.html`, `m.html`, replace the address `<li>` in the footer
`Contact` column:

```html
<!-- before -->
<li><a href="https://www.google.com/maps/search/?api=1&amp;query=House+3+Reservoir+Rd+Roche+Terre+Riviere+du+Rempart+Mauritius" target="_blank" rel="noopener noreferrer">House 3, Reservoir Rd, Roche Terre,<br />Riviere du Rempart, Mauritius</a></li>

<!-- after (recommended minimum) -->
<li>Rivière du Rempart, Mauritius <span aria-hidden="true">/</span> open to relocation</li>
```

Then regenerate `assets/Uttam-Torry-CV-2026.pdf` from a source where the contact
line reads `Rivière du Rempart, Mauritius` (or `Mauritius`) instead of the street
address, and re-run `pdfinfo` to confirm metadata stays clean.

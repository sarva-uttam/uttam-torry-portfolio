# Residual-risk register

Last reviewed: 2026-09-04. Severity = realistic impact × likelihood for *this*
static personal site. "Owner action" means it cannot be fixed in code.

| ID | Risk | Severity | Status | Recommended action |
|----|------|----------|--------|--------------------|
| **R1** | **Full residential address** was published on `index.html`, `faq.html`, `m.html` (footer) and inside `assets/Uttam-Torry-CV-2026.pdf`. | High → **Low** | **Site fixed; CV PDF outstanding** | The three pages now show region only: `Rivière du Rempart, Mauritius` (plain text, no Google Maps link). **Still to do (owner):** re-export `Uttam-Torry-CV-2026.pdf` from a source whose contact line reads `Rivière du Rempart, Mauritius` (or `Mauritius`) instead of the street address, then re-run `pdfinfo` to confirm metadata stays clean. Until then the address is still downloadable via the "Download CV" button. |
| **R2** | **No hosting-level response headers.** GitHub Pages cannot send `X-Content-Type-Options`, `Permissions-Policy`, `X-Frame-Options`; a `<meta>` CSP cannot express `frame-ancestors`. | Medium | **Fixed on header-capable hosts; open on GitHub Pages** | A `_headers` file (repo root) now carries the full real header set. It is honoured by Tiiny Host (paid), Netlify, Cloudflare Pages, etc. **GitHub Pages ignores `_headers`** — there the `<meta>` CSP + `<meta>` referrer remain the baseline, and fully closing this needs Cloudflare (free) in front or a move to a header-capable host. |
| **R3** | **No branch protection on `master`.** A compromised owner GitHub session can push straight to production; force-push/history-rewrite is possible. | Medium | Open — owner action | Enable branch protection: block force-push + deletion; optionally require the deploy workflow to pass. Keep 2FA on the GitHub account. |
| **R4** | **Supply chain: Google Fonts.** Runtime dependency on `fonts.googleapis.com` / `fonts.gstatic.com`. A compromise there could serve malicious CSS; Google also sees each visitor's IP + referrer. | Low–Medium | Open — owner decision | Self-host the four families (all OFL-licensed): download `woff2`, add a local `@font-face` block, remove the two `fonts.*` origins from CSP and the `<link>`/`preconnect`. ~250 KB added to the repo; removes a whole trust boundary and a GDPR-flavoured privacy issue. |
| **R5** | **Bandwidth-exhaustion DoS.** Scripted repeated downloads of the ~5 MB hero-frame set could trip the GitHub Pages ~100 GB/month soft limit and suspend the site until reset. No data or money at risk. | Low | Accepted (or fix via R2) | Cloudflare edge caching makes this impractical. Otherwise accept — self-heals monthly. |
| **R6** | **Actions supply chain (residual).** Four first-party `actions/*` are now SHA-pinned, but a compromise of an `actions/*` repo at a pinned SHA, or of the GitHub Actions runner platform, is still possible. | Low | Mitigated as far as practical | Dependabot surfaces bumps; owner reviews each. Repo setting *require SHA pinning* adds enforcement. |
| **R7** | **Local Semgrep OAuth token** in `.semgrep/guardian.yml` on the owner's machine. **Not committed** (git-ignored, never in history) but the repo lives in a **OneDrive-synced folder**, so the file is uploaded to Microsoft's cloud and any linked devices. Scope: Semgrep account/org identity (`b-b-org`), not code-exec or billing. | Low | Open — owner action | Rotate it (`semgrep logout` then re-auth, or revoke the token in Semgrep settings) **and** either move the working copy out of OneDrive or exclude `.semgrep/` from OneDrive sync. Do this without waiting — do not rely on it expiring. |
| **R8** | **Client-side XSS via a future contributor.** Today there is no sink; a later change adding `innerHTML`/`insertAdjacentHTML` from any external string would reintroduce risk. | Low | Mitigated (defence in depth) | CSP `script-src 'self'` blocks injected inline/remote script execution; code review; keep the "no `innerHTML`" rule. |
| **R9** | **Third-party outbound-link risk.** Links to LinkedIn/GitHub/Facebook/Pinterest/Reddit/Google Maps — those destinations' security is outside our control. | Low | Accepted | `rel="noopener noreferrer"` limits tab-nabbing + referrer leakage. |
| **R10** | Local-preview editor config formerly tracked an `npx --yes serve` command (unpinned npm package installed on the dev machine at preview time; never in CI or prod). | Info | Resolved | The editor-config directory was removed from the repo and added to `.gitignore`. Local preview is `python -m http.server` (see README). No production impact. |

## Appendix — R1 CV PDF remediation (owner to complete)

The three HTML pages are done. The remaining step is the CV:

1. In the source document for the CV, change the contact line from
   `House 3, Reservoir Rd, Roche Terre / Rivière du Rempart, Mauritius`
   to `Rivière du Rempart, Mauritius` (or just `Mauritius`).
2. Re-export to `assets/Uttam-Torry-CV-2026.pdf` (keep the filename — the nav
   and hero link to it).
3. Verify: `pdftotext assets/Uttam-Torry-CV-2026.pdf - | grep -i "reservoir\|roche terre"` returns nothing,
   and `pdfinfo assets/Uttam-Torry-CV-2026.pdf` still shows no personal Author/Title.

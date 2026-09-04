# Incident-response checklist

Small static site, single owner. Keep it simple. Work top to bottom.

## 0. Triage (first 15 minutes)

- [ ] What's the report? (defacement / injected script / leaked secret / account takeover / abuse / privacy)
- [ ] Confirm it's real — open the live site in a private window; view source; check `curl -sI`.
- [ ] Note the time, the source of the report, and what you observed. Start a short timeline note.

## 1. If the live site is defaced or serving unexpected content

- [ ] Check the last few commits on `master`: `git log --oneline -10 origin/master`. Anything you didn't push?
- [ ] Check recent Actions runs: <https://github.com/sarva-uttam/uttam-torry-portfolio/actions>. Any deploy you didn't trigger?
- [ ] If a bad commit is live: `git revert <sha>` (do **not** force-push), push, let the deploy run, confirm the site is clean.
- [ ] If the GitHub account itself is compromised, go to section 3 first.
- [ ] As a fast kill-switch: repo **Settings → Pages → unpublish**, or disable the Pages source, until fixed.

## 2. If a secret was exposed (committed key, leaked token)

- [ ] **Rotate/revoke the credential at its source first.** (Do not wait for it to expire.)
  - Semgrep token: `semgrep logout` then re-auth, or revoke in Semgrep account settings.
  - Any GitHub token/PAT: revoke in GitHub → Settings → Developer settings.
- [ ] Remove the secret from the working tree; confirm it's covered by `.gitignore`.
- [ ] If it was **committed**: rotating is the real fix. History rewrite (`git filter-repo`) is optional, disruptive, and needs owner sign-off — the secret must be considered burned regardless.
- [ ] Check GitHub → Security → Secret scanning alerts; resolve.
- [ ] Note what the credential could access and whether that access shows signs of misuse.

## 3. If the GitHub account is compromised

- [ ] Change the GitHub password; confirm 2FA is on; review **Settings → Sessions** and revoke unknown sessions.
- [ ] Review **Settings → Applications** (authorised OAuth apps / GitHub Apps) and **Developer settings → Personal access tokens**; revoke anything unrecognised.
- [ ] Review repo **Settings → Collaborators** and **Deploy keys**; remove anything you didn't add.
- [ ] Review **Settings → Webhooks** and Actions **secrets/variables**.
- [ ] Then do section 1 to restore the site content.

## 4. If it's abuse / traffic (bandwidth spike, scraping)

- [ ] Confirm via the repo **Insights → Traffic** and any Pages usage warning email.
- [ ] It cannot cost money or leak data. Options: wait it out (resets monthly), or stand up Cloudflare (free) in front and enable rate-limiting / "Under Attack" mode.

## 5. If it's a privacy report (e.g. the home address)

- [ ] This is a known item — see `residual-risks.md` R1. Apply the prepared diff, regenerate the CV, deploy.

## 6. Close-out

- [ ] Confirm the fix on the live site (private window, `curl -sI`, Playwright console check if JS changed).
- [ ] Reply to the reporter with what was done.
- [ ] Add a line to the timeline note: root cause + what changed.
- [ ] Update `threat-model.md` / `residual-risks.md` / `control-matrix.md` if the incident revealed a gap.
- [ ] If a control failed, add or fix a check in `deployment-checklist.md`.

## Contacts / references

- Owner: uttamtorry@gmail.com
- Repo: <https://github.com/sarva-uttam/uttam-torry-portfolio>
- Live: <https://sarva-uttam.github.io/uttam-torry-portfolio/>
- GitHub Pages status: <https://www.githubstatus.com/>
- GitHub security docs: <https://docs.github.com/code-security>

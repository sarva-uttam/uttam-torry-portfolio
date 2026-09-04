# Rate limiting, quotas, throttling, CAPTCHA and cost controls

**Status for the current site: Not Applicable across the board.**

Every control in this family needs a server endpoint, an authenticated user, or a
billable operation. This site has none:

| Control | Why N/A today |
|---------|---------------|
| Rate limiting (login / registration / password reset / contact / search / upload / DB mutation / public API / AI / webhooks / admin) | No backend, no API, no auth provider, no serverless function. Nothing receives a request except the GitHub Pages CDN serving a file. |
| Usage quotas (per-user / per-session / daily / monthly / payload / duration / concurrency) | No authenticated or metered feature. |
| Server-side throttling / concurrency limits / timeouts / backoff | No server-side work to throttle. |
| CAPTCHA (contact / registration / password reset / repeated failed login / anonymous AI) | Contact is a `mailto:` link only. There is **no submitted form** anywhere on the site. Adding a form + CAPTCHA purely to "look secure" is explicitly out of scope. |
| Cost controls (spend ceilings / token caps / model allowlists / circuit breakers / budget alerts) | No billable third-party call. Google Fonts is free and unmetered. No AI. No payments. |

The **one** abuse vector that does exist is **bandwidth exhaustion**: GitHub Pages
has a soft limit of ~100 GB/month and ~10 build/hour. A script repeatedly
downloading the ~5 MB hero-frame set could, in volume, get the site rate-limited
or suspended for the rest of the billing month. It cannot cost money (Pages is
free) and cannot expose data.

Mitigations, in order of preference:

1. **Accept it.** Personal portfolio, low target value, self-heals next month.
2. **Front the site with Cloudflare (free plan).** Gives edge caching (most
   requests never reach GitHub), plus optional rate-limiting rules and "Under
   Attack" mode. This is the recommended step and also unlocks real security
   headers — see `control-matrix.md`.
3. Reduce the hero payload (fewer / smaller frames, or a short video) so a
   single run costs less bandwidth.

## If the site ever gains a backend (policy to apply then)

If a contact form, newsletter signup, comment system, guestbook, AI feature or
any authenticated area is added later, implement **before shipping it**:

- **Rate limits, per endpoint, not one global limit.** Suggested starting points:
  - contact/newsletter submit: 3 / 10 min / IP **and** 20 / day / IP, plus a CAPTCHA (Cloudflare Turnstile, verified server-side).
  - any auth endpoint: 5 / 15 min / IP for failures, 10 / hour / account; never reveal whether an account/email exists; return `429` with a bounded `Retry-After`.
  - search / expensive read: 30 / min / IP.
  - AI / generation: per-user + global daily token budget, hard max tokens & timeout per call, model allow-list, circuit breaker, budget alert at 70 %/90 %.
- **Quotas** enforced server-side with atomic check-and-increment (no browser-supplied counters, no read-then-write races).
- **Payload caps**: max body size, max upload size, request timeout, max concurrency.
- **Cost ceilings**: per-day and per-month spend caps that hard-stop the feature; keys stay server-side and are never shipped to the browser.
- **Redacted logging**: record that an event happened, not its secret/PII content.

Until then, this document stands as the record that these controls were
considered and found not applicable — not overlooked.

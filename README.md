# Uttam Torry — Portfolio

Personal portfolio of **Uttam Torry**, a graduate software developer based in
Mauritius. A scroll-driven single-page site built with vanilla HTML, CSS and
JavaScript — no framework, no build step.

**Live:** https://sarva-uttam.github.io/uttam-torry-portfolio/
_(temporary GitHub Pages address — the site will move to its own domain soon; see
[Deployment](#deployment))._

---

## Overview

The landing page pins a full-screen `<canvas>` and scrubs a 300-frame image
sequence as you scroll, like a short film played by the scrollbar. Four content
panels — **headline**, **selected work**, **about** and **core capabilities** —
assemble and disassemble over the portrait as you move through it. Phones get a
separate, lightweight vertical layout, and a standalone **FAQ** page shares the
same design system.

## Highlights

- **Zoom- and resize-stable composition.** The whole scene is laid out on a fixed
  `1280 × 720` stage that is cover-scaled to the viewport with a single
  `transform`, so nothing drifts relative to anything else at any zoom level.
- **Reversible scroll motion.** Panel elements fly in from their side of the
  stage, hold, then fly back out — driven purely by scroll position, so it plays
  cleanly in both directions.
- **Dedicated mobile build** (`m.html`) with automatic device routing and a
  manual override.
- **Accessible FAQ** using native `<details>`/`<summary>`, keyboard-operable,
  with structured data.
- **Security-reviewed.** Strict Content-Security-Policy, no third-party scripts,
  hardened deploy workflow — see [`docs/security/`](docs/security/).

## Tech

| | |
|---|---|
| Markup / styling | HTML5, modern CSS (container queries, `clamp()`, grid) |
| Behaviour | Vanilla JavaScript (ES5-compatible, no dependencies) |
| Type | Anton, Space Grotesk, JetBrains Mono, Playfair Display (Google Fonts) |
| Hosting | GitHub Pages via GitHub Actions |
| Tooling | None required — static files only |

## Running locally

The frame sequence loads over HTTP, so open it through a local server rather than
`file://`:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Desktop site — loader, nav, pinned hero with four panels, footer, contact dialog |
| `m.html` | Mobile site — a plain vertical layout sharing the same header, footer and assets |
| `faq.html` | Standalone FAQ page |
| `styles.css` | All styling, including the mobile (`.m-*`) and FAQ (`.faq-*`) blocks |
| `script.js` | Frame preloader and renderer, stage scaling, scroll → frame mapping, panel motion, nav drawer, FAQ accordion |
| `route.js` | Device detection and desktop ↔ mobile routing (runs before first paint) |
| `assets/frames/` | 300 JPG frames (`ezgif-frame-001.jpg` … `ezgif-frame-300.jpg`) |
| `assets/Uttam-Torry-CV-2026.pdf` | CV, linked from the nav and hero |
| `_headers` | Response-header policy for header-capable hosts (Netlify / Cloudflare Pages); ignored by GitHub Pages |
| `docs/security/` | Threat model, control matrix, residual-risk register, checklists |

## How it works

### The locked stage

`script.js` sets `--hsc = min(vw / 1280, vh / 720)` and the `.hero__stage`
element is `transform: scale(--hsc)`. Because one transform scales the portrait
**and** every overlay together, they can never move apart. `container-type: size`
on the stage pins the container units the panels use, so a browser zoom rescales
the whole composition instead of reflowing it. Off-ratio windows get thin
letterbox bars in the theme colour.

### Scroll and motion

`.hero` is `900vh` tall; the sticky stage stays pinned for that distance. Scroll
progress `0 → 1` maps to frame `1 → 300`, drawn to the canvas and smoothed with a
`requestAnimationFrame` lerp. Each panel has an entry and exit window; within
them, `panelAnim()` moves every `[data-anim]` element along a staggered path.
Panel timing and the capabilities-ring geometry are constants at the top of
`script.js`.

### Mobile and routing

`route.js` checks pointer type, screen size and user-agent. Phones are sent to
`m.html`; everything else to `index.html`. A **"Mobile site" / "Desktop site"**
link in the footer records an explicit choice in `localStorage`; `?mobile=1` and
`?desktop=1` force it. The URL fragment is preserved across the redirect.

### FAQ

`faq.html` groups twelve questions into four sections using native
`<details>`/`<summary>` — keyboard-operable, screen-reader friendly, with a CSS
open/close indicator and `FAQPage` JSON-LD that mirrors the visible answers.

## Security

The site is static (no backend, database, authentication, forms or payments), so
the attack surface is small. In place: a strict `<meta>` Content-Security-Policy
on every page, `Referrer-Policy` and `rel="noopener noreferrer"` on every
external link, a hardened GitHub Actions deploy (least-privilege token,
SHA-pinned actions), Dependabot on the workflow, and no secrets in the repository
or its history.

See [`SECURITY.md`](SECURITY.md) for the vulnerability-reporting process and
[`docs/security/`](docs/security/) for the full threat model, control matrix and
residual-risk register.

## Deployment

The site is currently served from **GitHub Pages** at
`https://sarva-uttam.github.io/uttam-torry-portfolio/`. This is a temporary
address: once the accompanying projects are ready to publish alongside it, the
portfolio will move to its **own custom domain**.

When the domain is added:

1. Set it under **Settings → Pages → Custom domain** and commit the `CNAME` file GitHub creates.
2. Turn on the real response headers from [`_headers`](_headers) — either by moving to a host that honours them (Netlify, Cloudflare Pages) or by putting Cloudflare (free) in front of GitHub Pages. Details in [`docs/security/control-matrix.md`](docs/security/control-matrix.md).
3. Add `includeSubDomains; preload` to HSTS only once every subdomain is HTTPS-safe.

## Author

**Uttam Torry** · uttamtorry@gmail.com ·
[LinkedIn](https://www.linkedin.com/in/uttam-torry-490702361/) ·
[GitHub](https://github.com/sarva-uttam)

# Uttam Torry — Portfolio

A portfolio built around a scroll-scrubbed cinematic hero that plays the
**full video (frames 1 → 300)**. Overlay panels cross-fade over the portrait as
you scroll; the contact footer follows the last frame. A second page,
`faq.html`, shares the nav, footer and assets.

## Run

Needs a local server (the frames load via `Image`, so `file://` won't work):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Loader, shared nav, pinned hero with 4 overlay panels, shared footer, connect dialog |
| `faq.html` | Standalone FAQ page — shares the nav, footer, `styles.css` and `script.js` |
| `styles.css` | All styling + responsive rules (`.faq-*` block for the FAQ page) |
| `script.js`  | Frame preloader, canvas renderer, stage scaling, scroll → frame mapping, `panelAnim` assemble/disassemble, `updateRing`, reveal-on-scroll, `initNav` (mobile drawer), `initFaq` (accordion), `initViewSwitch`. Hero/canvas work is guarded by `HAS_HERO`, so `faq.html` and `m.html` load the same file safely |
| `m.html` | Dedicated mobile build — a normal vertically-scrolling page (no frame scrubbing) |
| `assets/frames/` | 300 JPG frames (`ezgif-frame-001.jpg` … `ezgif-frame-300.jpg`) |
| `assets/Uttam-Torry-CV-2026.pdf` | CV linked from the nav (all pages) and hero |

## The locked stage (why nothing drifts on zoom)

The whole scene is composed on a **fixed `1280 × 720` stage** (`.hero__stage`,
matching the frame aspect). `script.js` sets `--hsc = min(vw/1280, vh/720)` and
the stage is `transform: scale(--hsc)` — one transform for the portrait *and*
every overlay, so they can never move relative to each other. `container-type:
size` on the stage pins the `cqw` / `cqh` units the panels use to `12.8px` /
`7.2px`, so a browser zoom (which only changes the CSS-pixel viewport) rescales
the poster as a whole instead of reflowing it. Off-ratio windows get thin
theme-coloured letterbox strips.

## How the scroll works

`.hero` is `900vh` tall; `.hero__sticky` pins for that whole distance. Scroll
progress `0 → 1` maps to frame **`1 → 300`**, drawn straight to the `1280 × 720`
`<canvas>`, smoothed with a `requestAnimationFrame` lerp.

Four overlay panels **assemble / disassemble** as you scroll (`panelAnim()`):
each `[data-anim]` element flies in from its side of the stage, staggered, holds,
then flies back out in reverse — all a pure function of scroll position, so it is
fully reversible when scrolling back up (no pop-in / pop-out).

| Frames    | Panel |
|-----------|-------|
| 1 – ~34   | **Hero** — headline, availability pill, right-hand fact rail. Seated at rest; disassembles upward as you scroll in |
| ~58 – 150 | **Selected work** — 4 project cards flanking the character |
| ~140 – 236| **About** — bio column left, oversized `CAREFUL ENGINEERING, / ROOM TO` *and* `GROW.` type right, spoken languages |
| ~228 – 300| **Core capabilities** — 8 neon-white cards fly out from the centre onto a big circle (`updateRing()`), revolve ~250°, then **freeze and hold**. Cards ride the left/right arcs; the top/bottom run off-stage so the face stays clear |
| after     | pin releases → the **footer** scrolls up over the last frame |

Panel timing lives at the top of `script.js` (`HERO_OUT`, `WORK_IN/OUT`,
`ABOUT_IN/OUT`, `RING_IN`, `RING_REV`, `RING_ROT`); ring geometry is `RING_R` /
`RING_CARD` plus the `.rp__ring` centre in `styles.css`.

## Mobile build (`m.html`) + device routing

`route.js` — a tiny same-origin script loaded synchronously in the `<head>` of
`index.html` and `m.html` — checks `pointer: coarse` / `hover: none` + screen
size + user-agent. Phones are sent to `m.html`; everything else to `index.html`.
A **"Mobile site" / "Desktop site"**
link in the footer (`data-view`) records an explicit choice in `localStorage`
(`siteView`), and `?mobile=1` / `?desktop=1` force it. The hash is preserved
across the redirect.

`m.html` is a plain vertical scroll: one portrait `<img>`, then the four sections
stacked as real content (`.m-*` classes), with `.m-reveal` fade-up on scroll. It
shares the nav, footer, connect dialog, `styles.css` and `script.js`.

The **footer** (`#footer`): full-bleed, compact. HUD corner brackets,
`LET'S CONNECT`, a "Start a conversation" button, a three-column block, angle
ticks and a decorative arc. Its pieces fade up via `.reveal` + `IntersectionObserver`.

## FAQ page

`faq.html` (linked as **FAQs** in the nav — desktop and mobile — and in the
footer). Editorial layout that matches the site: Anton headline
`THE USEFUL ANSWERS, UP FRONT.`, a sticky topic navigator and four groups
(Opportunities / Experience & skills / Projects / Working together) of native
`<details>`/`<summary>` accordions — three questions each, twelve total.

- Accessible by default: native disclosure semantics, keyboard operable, visible
  `:focus-visible` outlines, a CSS plus/minus indicator, a subtle open animation
  that `prefers-reduced-motion` disables.
- `initFaq()` keeps one item open per group (opening a second closes the first);
  cross-group items are independent.
- `FAQPage` JSON-LD in the `<head>` mirrors the visible Q&A.
- Ends with `Still curious? Let's connect.` — `Email me`
  (`mailto:uttamtorry@gmail.com?subject=Software%20development%20opportunity`),
  GitHub and LinkedIn.

## Navigation & links

- **Nav** (shared markup on both pages): brand → `index.html#top`; links
  Home / About / Projects / Capabilities → `index.html#…`, FAQs → `faq.html`
  (`aria-current="page"` on the current page), Download CV. Below 1080px the
  links collapse into a slide-in drawer toggled by `#navToggle` (`initNav()` —
  `aria-expanded`, `.nav.is-open`, closes on link click / Escape / outside click).
- **Download CV** (nav + hero) → `assets/Uttam-Torry-CV-2026.pdf` with `download`
  (see `assets/README.txt`).
- **Scroll anchors** — invisible `.scroll-anchor` targets inside the pinned hero:
  `#projects` 27% · `#about` 55% · `#capabilities` 82%. Footer links use the
  `index.html#…` form so they also work from `faq.html`.
- **Social icons** (hero + footer + connect dialog) → the real profiles
  (`github.com/sarva-uttam`, `linkedin.com/in/uttam-torry-490702361`,
  `facebook.com/share/1JbB2YLpCV`, `pinterest.com/sarva_uttam`,
  `reddit.com/user/sarva-uttam`). Email everywhere is `mailto:`.

## The "Start a conversation" chooser

- **"Let's connect"** (hero) and **"Start a conversation"** (footer) are
  `<button data-connect>` — they open `#connectModal`, a native `<dialog>`
  (`initConnect()` in `script.js`) offering Email / LinkedIn / Facebook /
  Pinterest / Reddit. Closes on the ✕, backdrop click, or Escape.

## Tuning (top of `script.js`)

```js
var STAGE_W = 1280, STAGE_H = 720;   // the locked design stage
var HERO_OUT  = [34, 68];            // hero disassembles over this frame range
var WORK_IN   = [58, 98];  var WORK_OUT  = [118, 150];
var ABOUT_IN  = [140, 182]; var ABOUT_OUT = [204, 236];
var RING_IN   = [228, 272];          // cards fly out; then hold to the end
var RING_REV  = [262, 298];          // the revolve
var RING_ROT  = [-224, 26];          // start / end angle (~250° turn)
var RING_R = 452, RING_CARD = 146;   // ring geometry (centre: .rp__ring in CSS)
```

`.hero { height: 900vh }` in `styles.css` controls scroll-per-frame. The desktop
hero does **not** reflow at any width — it is a cover-fit poster; phones get
`m.html` instead. Only the nav (→ drawer ≤ 1080px) and footer (→ 2 / 1 columns)
stay responsive.

## Security

This is a static site (no backend, database, auth, forms or payments), so the
security surface is small. What's in place:

- Strict `<meta>` **Content-Security-Policy** on every page (`script-src 'self'`,
  no `unsafe-eval`; locked to self + Google Fonts). The `<head>` routing logic
  lives in `route.js` so no inline script is needed.
- `Referrer-Policy: strict-origin-when-cross-origin` + `rel="noopener noreferrer"`
  on every external link.
- Deploy workflow: `permissions: {}` at top, minimal job permissions,
  `persist-credentials: false`, all `actions/*` pinned to commit SHAs, watched by
  Dependabot (`.github/dependabot.yml`).
- No secrets in the repo or its history; secret scanning + push protection on.

Full audit, threat model, control matrix and residual-risk register:
[`docs/security/`](docs/security/) and [`SECURITY.md`](SECURITY.md). Some
controls (real `X-Content-Type-Options` / `Permissions-Policy` / frame-ancestors
headers) need a header-capable host — see the control matrix.

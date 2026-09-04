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
| `script.js`  | Frame preloader, canvas renderer, scroll → frame mapping, panel cross-fade, `staggerReveal`, `updateRing`, reveal-on-scroll, `initNav` (mobile drawer), `initFaq` (accordion). Hero/canvas work is guarded by `HAS_HERO`, so `faq.html` loads the same file safely |
| `assets/frames/` | 300 JPG frames (`ezgif-frame-001.jpg` … `ezgif-frame-300.jpg`) |
| `assets/Uttam-Torry-CV-2026.pdf` | CV linked from the nav (both pages) and hero |

## How the scroll works

`.hero` is `900vh` tall; `.hero__sticky` pins for that whole distance. Scroll
progress `0 → 1` maps to frame **`1 → 300`**, drawn to a `<canvas>` (cover-fit),
smoothed with a `requestAnimationFrame` lerp. The site starts on the first frame
and ends on the last.

Four overlay panels ride on top of the pinned canvas (edge-only gradient
backgrounds so the portrait stays visible through the centre):

| Frames    | Panel |
|-----------|-------|
| 1 – ~56   | **Hero** — headline, availability pill, right-hand fact rail; rises + fades out |
| ~66 – 124 | **Selected work** — 4 project cards flanking the character, outlined numbers, mini-vizzes |
| ~146 – 206| **About** — bio column left, oversized `CAREFUL ENGINEERING, / ROOM TO` *and* `GROW.` type right, spoken languages; elements rise-in / fade-out via `staggerReveal()` |
| ~226 – 300| **Core capabilities** — 8 neon-white cards on a big circle around the character (`updateRing()`): still on approach → a ~270° revolve → freezes and holds. Cards ride the left/right arcs; the top/bottom of the circle run off-screen |
| after     | pin releases → the **footer** scrolls up over the last frame |

The **footer** (`#footer`): full-bleed (padding defines the side gutters, no
inner max-width), compact height. HUD corner brackets, `LET'S CONNECT`, a
"Start a conversation" button, a three-column block (brand + socials /
navigation / contact), `40°/30°/20°` ticks and a decorative arc. Its pieces fade
up on scroll via the `.reveal` + `IntersectionObserver` in `script.js`.

The scrolled nav uses a soft top-anchored gradient (`.nav::before`) that fades to
nothing — no hard "bar" edge. The portrait is nudged **down** in `drawFrame()`
(`dy = (ch - dh) / 2 + dh * 0.05`) so his head isn't cropped at the top.

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
var LAST_FRAME    = 300;
var HERO_OUT      = [56, 74];      // hero overlay fades out over this frame range
var WORK_IN/OUT   = [66,88] / [124,140];
var ABOUT_IN/OUT  = [146,168] / [206,222];
var RING_IN       = [226, 242];   // ring fades in, then holds to the end (no fade-out)
var RING_ROT_WIN  = [0.12, 0.72]; // fraction of the ring's life where it revolves
var RING_ROT      = [-248, 22.5]; // start / end angle of the revolve
```

`.hero { height: 900vh }` in `styles.css` (plus the `820vh` / `740vh` overrides in
the media queries) controls scroll-per-frame. Responsive: ≤ 1080px every panel
becomes a single scrolling column / 2-col grid and the footer goes to 2 columns;
≤ 720px everything stacks.

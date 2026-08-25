# Uttam Torry — Portfolio

Personal portfolio site for Uttam Torry, Software Developer. Built with plain
HTML, CSS, and JavaScript — no framework, no build step.

## Sections

- **Hero** — name, title, tagline, and calls to action, with an animated
  canvas particle background over a dark green gradient.
- **About** — a short bio and a downloadable resume.
- **Skills** — a grid of technical skills and services, from core web
  development to systems architecture, Docker, AI content consulting, and
  small-business automation.
- **Projects** — featured work, each with a description, tech tags, and a
  link to the live project or repo.
- **Contact** — a simple contact form (name, email, message).

## Tech

- Semantic HTML5
- CSS custom properties for theming (dark green background, electric green
  accents), CSS Grid/Flexbox layouts, and a responsive mobile nav
- Vanilla JavaScript for the particle animation and the mobile menu toggle
  (no dependencies)
- [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts

## Running locally

No build step is required. Either open `index.html` directly in a browser,
or serve the folder so relative asset paths resolve cleanly:

```bash
npx serve .
```

## Project structure

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    └── Uttam-Torry-Resume.pdf
```

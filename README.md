<div align="center">

# Uttam Torry — Software Developer Portfolio

### Careful engineering. Thoughtful digital products. Room to grow.

A cinematic, interactive portfolio presenting my work, technical capabilities and journey as a graduate software developer based in Mauritius.

[View the live portfolio](https://sarva-uttam.github.io/Portfolio.ut/) · [Download my CV](assets/Uttam-Torry-CV-2026.pdf) · [Connect on LinkedIn](https://www.linkedin.com/in/uttam-torry-490702361/)

</div>

---

## About the portfolio

This portfolio is more than a collection of links. It is a deliberately crafted web experience designed to show how I approach software: with attention to detail, clarity and a strong connection between engineering and presentation.

The desktop experience turns scrolling into a visual narrative. A 300-frame cinematic sequence moves through my introduction, selected projects, background and capabilities, while a dedicated mobile version presents the same content in a fast, natural vertical layout.

## Featured work

The portfolio introduces four projects that reflect different sides of my interests:

- **ISeeCode** — a visual code interpreter that explains program execution step by step.
- **Enveloped** — a full-stack platform for creating personalised digital invitations.
- **Zordi Budget Tracker** — a civic-technology product for tracking public commitments through evidence and verified outcomes.
- **Bwoo & Bloo’s Books** — a structured creative-publishing system for consistent educational book production.

## Experience highlights

- Scroll-controlled animation mapped across 300 image frames
- Smooth canvas rendering with preloading and frame interpolation
- Reversible, position-based panel transitions
- Separate desktop and mobile experiences with remembered view preferences
- Responsive navigation and accessible interactive elements
- Downloadable CV, social links and a contact chooser
- Dedicated FAQ page with keyboard-friendly accordions
- Automatic deployment through GitHub Pages

## How I executed the website

I began by defining the portfolio as a guided story rather than a conventional page. The desktop composition was built on a fixed 1280 × 720 stage so the portrait, typography and interface elements remain aligned at different viewport sizes and zoom levels.

I then mapped scroll progress to the image sequence and used JavaScript to preload, render and smoothly transition between frames on a canvas. Each content panel is driven by the same scroll position, making every entrance and exit predictable and reversible. For phones, I created a dedicated lightweight layout that prioritises readability and natural scrolling.

The result is a static website with no build step or backend: focused, portable and easy to deploy.

## Built with

- Semantic HTML5
- Modern CSS
- Vanilla JavaScript
- Canvas API
- Intersection Observer API
- Native `<dialog>` and `<details>` elements
- GitHub Actions and GitHub Pages

## Project structure

```text
Portfolio.ut/
├── index.html                 # Cinematic desktop experience
├── m.html                     # Dedicated mobile experience
├── faq.html                   # Frequently asked questions
├── styles.css                 # Visual system and responsive styling
├── script.js                  # Animation, navigation and interactions
├── assets/
│   ├── frames/                # 300-frame hero sequence
│   └── Uttam-Torry-CV-2026.pdf
└── .github/workflows/
    └── deploy-pages.yml       # GitHub Pages deployment
```

## Run locally

The frame sequence must be served over HTTP rather than opened directly from the file system.

```bash
git clone https://github.com/sarva-uttam/Portfolio.ut.git
cd Portfolio.ut
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

## Deployment

Every push to the `master` branch triggers the GitHub Actions workflow, packages the static files and publishes the latest version to GitHub Pages.

---

<div align="center">

Built with care by **Uttam Torry**  
Open to graduate and junior software-development opportunities.

</div>

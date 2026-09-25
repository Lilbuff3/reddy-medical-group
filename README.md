# Reddy Medical Group

A boutique, patient-first website for Reddy Medical Group, an independent medical practice in Fresno, California.

The primary experience is now built with Astro using native `.astro` components, static output, and small vanilla JavaScript islands for navigation, suite switching, and fax copying. The site intentionally does not collect protected health information.

## Practice information

- **Reddy Medical Group, Inc.**
- **Location:** Meridian Professional Center, 7045 North Maple Avenue, Suites 101 & 108, Fresno, CA 93720-8008
- **Phone:** `(559) 326-7393`
- **Clinical fax:** `(559) 369-2488`
- **Administrative fax:** `(559) 446-0409`
- **Care:** Adult internal medicine, inpatient hospitalist medicine, and infectious disease consultation
- **Physicians:** Dr. Kiran Manthani Reddy, MD and Dr. Manthani Padmanabh Reddy, MD

## Astro project structure

```text
.
├── src/
│   ├── components/
│   │   ├── AccessSection.astro
│   │   ├── BrandMark.astro
│   │   ├── CareSection.astro
│   │   ├── DoctorsSection.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   └── VisitSection.astro
│   ├── layouts/Layout.astro
│   ├── pages/index.astro
│   └── styles/global.css
├── public/
│   └── reddy-medical-group-entrance.jpg
├── astro.config.mjs
└── package.json
```

The repository also preserves the original static site and experimental suite navigator prototypes for reference and backwards compatibility. Astro is the canonical application experience.

## Local development

Requirements: Node.js 18.17 or newer.

```bash
npm install
npm run dev
```

The development server binds to `0.0.0.0` for remote previews. To choose a port:

```bash
npm run dev -- --port 4321
```

## Production build

```bash
npm run build
npm run preview
```

Astro outputs the static site to `dist/`.

## Design and engineering notes

- The visual direction is **calm precision**: editorial typography, generous negative space, restrained clinical color, and subtle tactile depth.
- The page uses semantic HTML, responsive layouts, visible keyboard focus, reduced-motion support, accessible tabs, descriptive image alt text, and no PHI collection.
- External portal and map links open in a new tab with `rel="noreferrer"`.
- Medical practice structured data is emitted from the Astro page for local search context.
- Below-the-fold imagery is lazy loaded; the hero image is prioritized.

## Related repository assets

- `PITCH_PROPOSAL.md` — practice and digital strategy proposal
- `docs/Reddy_Medical_Group_Digital_Strategy.pdf` — strategy presentation
- `suite-navigator/` — 2D suite navigation prototype
- `suite-navigator-3d/` — 3D suite navigation prototype

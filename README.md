# Seeing — Donation Page (Ready for GitHub Pages)

This bundle contains the finalized version with all changes discussed:

- Expanded **About (מי אנחנו)** section with additional paragraphs.
- **Shopping-like** one-time items in **איך אפשר לעזור?**; removed dedication & puppy-adopt, added real products (bowls, blanket, kennel, vet visit, toys, outreach, pro harness, training leash).
- Visuals: **inline SVG icons** for all cards + Why-section.
- Optional animations via **Lottie**: lazy-loaded on view; respects `prefers-reduced-motion`.
- Top donation presets: **[100, 180, 360, 555, 1000, 'סכום אחר']** (removed 50).
- Robust frequency toggle + modal fully centered with improved spacing.
- Cache-busting query strings on `style.css` and `script.js` to avoid stale caches.

## Folder structure
.
├── index.html
├── script.js
├── style.css
├── assets/
│   └── README.txt
└── README.md

## Deploying to GitHub Pages
1. Go to **Settings → Pages**.
2. Source: **Deploy from branch**. Choose branch (e.g. `main`) and folder:
   - If **root** is selected: place `index.html`, `style.css`, `script.js` and `assets/` in repository root.
   - If **/docs** is selected: put these files inside `/docs` instead, and ensure *all relative paths stay the same*.
3. Commit & push. Wait for Pages to rebuild.
4. Hard refresh the site (Cmd/Ctrl + Shift + R). Open DevTools Console:
   - You should see: `[seeing] script loaded`.
5. To enable Lottie animations: drop your JSON files into `assets/` using the filenames listed above.

## Notes
- All script and stylesheet paths are **relative** (no leading `/`), so the site works at sub-paths like `/seeing/`.
- Lottie is loaded from a CDN (`unpkg`). If blocked, SVG fallbacks remain visible.
- If you change the directory layout, update the references in `index.html` accordingly.

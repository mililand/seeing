# Deploying to GitHub Pages (Project Site)

You have two options depending on your repo's Settings → Pages configuration.

## Option A: Source = Branch → `/ (root)`
1. Copy these files to the repository root (same folder as README.md):
   - `index.html`
   - `script.js`
   - `style.css`
   - `assets/` (folder)
   - `.nojekyll` (file)
2. Commit & push.
3. Hard refresh your site (Cmd/Ctrl + Shift + R). Open DevTools Console and confirm you see `[seeing] script loaded`.

## Option B: Source = Branch → `/docs`
1. Create a `docs/` folder (if it doesn't exist) and copy the *contents of the `docs/` bundle* into it:
   - `docs/index.html`
   - `docs/script.js`
   - `docs/style.css`
   - `docs/assets/` (folder)
   - `docs/.nojekyll` (file)
2. Commit & push.
3. Hard refresh (Cmd/Ctrl + Shift + R) and check the console log.

### Notes
- All paths in `index.html` are **relative**, so the site works correctly at sub-paths (e.g., `/seeing/`).
- Lottie is optional: if there are no JSON files under `assets/`, the inline SVG icons will show instead.
- To enable Lottie animations, drop JSON files into `assets/` matching the data-lottie-path values already present in `index.html`.

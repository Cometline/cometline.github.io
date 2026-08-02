# cometline.github.io

Static marketing site for Cometline, intended for GitHub Pages.

## Files

- `index.html` — landing page markup and release-link bootstrap script
- `styles.css` — site styling
- `static/` — hero video, app icons, and UI screenshots used by the page
- `scripts/update-download-stats.mjs` — server-side GitHub release stats generator
- `.github/workflows/update-download-stats.yml` — daily stats refresh workflow

## Publishing on GitHub Pages

Use GitHub Pages with deployment from the repository root on the default branch.

The download CTA reads cached release metadata from:

- `./static/download-stats.json`

GitHub Actions updates the cached data once per day by fetching all release pages server-side. It
stores downloads for the current week and the latest DMG URL. If the API is temporarily
unavailable, the last successful stats file remains available to the landing page.

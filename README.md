# cometline.github.io

Static marketing site for Cometline, intended for GitHub Pages.

## Files

- `index.html` — landing page markup and release-link bootstrap script
- `styles.css` — site styling
- `static/` — hero video, app icons, and UI screenshots used by the page

## Publishing on GitHub Pages

Use GitHub Pages with deployment from the repository root on the default branch.

The download CTA currently resolves from:

- `https://api.github.com/repos/Cometline/cometline/releases/latest`

The page fetches the latest release metadata in the browser, finds the newest `.dmg` asset,
and turns the primary download buttons into direct DMG links. If the API request fails, it
falls back to the public releases page.

# TELEM SWAGY

Official website for D BWOY TELEM.

## Contents

- `index.html` — homepage
- `styles.css` — layout and visual system
- `script.js` — navigation, Ku Bar player, newsletter, booking form
- `audio/` — track files (Ku Bar)
- `api/` — optional Node subscription API (Render)

## Run locally

From the project folder:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

Or open `index.html` directly in a browser (some browsers restrict `file://` audio).

## Deploy (GitHub Pages)

1. Push this repo to GitHub (remote may already be set).
2. In the repository: **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main` (or your release branch) → folder `/` (root).
4. Save and wait for the Pages URL.

All frontend assets use relative paths from the repo root so Pages works without a build step.

## Newsletter API (optional)

Without an API, subscriptions are stored in the visitor’s `localStorage` waitlist and the UI reports that honestly.

When the Express API on Render (see `render.yaml` / `api/server.js`) is live, set the origin in `index.html` before `script.js`:

```html
<script>
  window.TELEM_API_URL = 'https://your-service.onrender.com';
</script>
```

The frontend will `POST` to `{TELEM_API_URL}/subscribe`. Configure SMTP via `.env` / Render env vars (`SMTP_*`, `FROM_EMAIL`) — see `.env.example`. Do not commit `.env`.

## Features

- Full-bleed hero with Ku Bar cover art
- Custom Ku Bar audio player (play/pause, seek, times)
- Booking inquiry form (opens `mailto:contact@telemswagy.com`)
- Newsletter subscribe (API or local waitlist)

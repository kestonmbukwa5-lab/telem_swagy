# TELEM SWAGY

Official website for D BWOY TELEM.

## Contents

- `index.html` — homepage for TELEM SWAGY
- `styles.css` — site styles and responsive layout
- `script.js` — mobile navigation behavior

## Run

Open `index.html` in a browser to view the website.

## Local test server

From the project folder, run:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8080/`.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Run `./deploy-to-github.ps1 -RemoteUrl https://github.com/username/repo.git`.
3. In GitHub, enable Pages for branch `main` and root folder `/`.

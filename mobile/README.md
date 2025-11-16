# mobile — Amiga Workbench theme (mobile)

This folder contains a small static Amiga Workbench–themed UI optimized for phones. Two apps (Skills and CV) open in windowed dialogs by loading the markdown files from `../data/skills.md` and `../data/cv.md`.

Files
- `index.html` — the workbench UI and icon grid
- `style.css` — Amiga-like styling and responsive rules for modern phones
- `app.js` — lightweight logic to open windows and render a small subset of Markdown

Quick local test

1. From the repository root run a simple HTTP server (serving files avoids file://-fetch restrictions):

```bash
python3 -m http.server 8000
```

2. On your phone or emulator open `http://<your-machine-ip>:8000/mobile/`.

Notes
- The app loads markdown from `../data/*.md`; if you move the files change the paths in `app.js`.
- The markdown renderer is intentionally minimal (headings, lists, paragraphs, links, bold/italic).

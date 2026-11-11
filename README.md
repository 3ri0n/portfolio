# Erion Hani Portfolio

The portfolio is a static site served by GitHub Pages. From the repository root, run `python -m http.server 8000` and open `http://localhost:8000` for a local preview.

- Edit the portfolio sections and links in `index.html`. The terminal is the landing page. `/projects`, `/certificates`, and other slash commands open sections. Bare section names print a summary.
- `style.css` contains theme tokens and shared UI. `studio.css` contains the portfolio layouts, certificate gallery, and project visuals.
- `app.js` initializes the site. The `js` directory contains separate modules for theme and welcome behavior, navigation, terminal commands, background effects and the canvas game.
- The typing easter egg uses `minigame.html`, `minigame.css`, `js/typing-test.js` and `sentences.txt`.
- `assets/projects/` contains original hardware photos and rendered views of the Eclipson Model B XL. The source CAD is kept offline. `assets/certificates/` contains public course records and an excerpt of the degree diploma.

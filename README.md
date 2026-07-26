# Monkey 26 — Global Random Pick Lab

A cinematic, filterable implementation of Burton Malkiel's blindfolded-monkey thought experiment.

Version 3 expands the original 31-ticker prototype into a governed **Global 360** universe and lets the user define what the monkey is allowed to hit.

## What actually ships

The current codebase is a layered stack of patches applied on top of the original version:
- `index.html` redirects to `v4.html`.
- `v4.html` loads `v4-animation.js`, which dynamically injects `v5.css` and chain-loads `v6.js` -> `v7.js` -> `v8.js` -> `v9.js`.
- Each JS layer injects its own stylesheet and rewrites the DOM produced by the previous layer.
- Application state is read back out of the DOM via `parseInt(textContent)`.
- The UI claims a cryptographic draw, but `v3-engine.js` silently falls back to `Math.random()` when crypto is unavailable.
- `app.js`, `tickers.js`, and intro media files have been moved out of the served root.

## Run locally

Because the universe is loaded through `fetch`, serve the repository through a local web server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Validate the Global 360 source

```bash
node scripts/validate-universe.js
```

The validator checks source-file availability, field structure, record count, mandatory values and group/ticker uniqueness.

## Disclaimer

Monkey 26 is an educational statistical experiment. It does not provide investment advice, recommendations or live market data.

# The Blindfolded Monkey — Random Pick Lab

A cinematic browser-based experiment inspired by Burton Malkiel’s blindfolded-monkey thought experiment.

The simulator reshuffles a 31-ticker watchlist before every throw, deals 25 hidden cards to a 5 × 5 wall, and selects one card using unbiased integer generation. Because each ticker has a 25/31 chance of being dealt and each dealt card has a 1/25 chance of being struck, every ticker has an exact selection probability of 1/31.

## Features

- Cryptographic random-number generation through `crypto.getRandomValues`
- Fisher–Yates shuffle before every throw
- Rejection sampling to remove modulo bias
- Single, 10-throw, and 100-throw simulation modes
- Hidden-wall audit mode
- Ticker-level chi-square fairness test and p-value
- Normalised Shannon entropy
- Expected-versus-observed ticker coverage
- Regime distribution analysis
- Exportable CSV ledger
- Responsive desktop and mobile interface
- No frameworks or external dependencies

## Run locally

Open `index.html` directly in a modern browser, or serve the repository with any static web server.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

- `index.html` — interface and semantic structure
- `styles.css` — responsive visual system
- `tickers.js` — 31-entry experiment dataset
- `app.js` — simulation, analytics, interaction, and export logic

## Disclaimer

This is an educational statistical experiment and not investment advice.

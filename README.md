# Monkey 26 — Global Random Pick Lab

A cinematic, filterable implementation of Burton Malkiel's blindfolded-monkey thought experiment.

Version 3 expands the original 31-ticker prototype into a governed **Global 360** universe and lets the user define what the monkey is allowed to hit.

## What actually ships

The codebase uses a clean ES Module architecture:
- `index.html` serves as the unified entry point.
- Four main ES Modules drive the application: `data.js`, `engine.js`, `ui.js`, and `animation.js`.
- Data is fully governed and statically validated, managed as JSON records rather than fragile delimited strings.
- Statistical tracking calculates live expected coverage, p-values, and entropy based directly on internal state, not DOM reading.
- The UI transparently notes when crypto randomness is unavailable, falling back securely while alerting the user.

## Data maturity

Global 360 is a curated beta research universe. Size bands are design classifications rather than live calculations. Stable identifiers, live market capitalisation, liquidity, corporate-action handling and return tracking remain planned enrichment layers.

**Note on survivorship bias:** The current curated universe has a heavy concentration of mega-cap and large-cap securities (338 out of 360). This is a known survivorship and selection bias that should be accounted for when interpreting aggregate performance simulations.

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

# Monkey 26 — Global Random Pick Lab

A cinematic, filterable implementation of Burton Malkiel's blindfolded-monkey thought experiment.

Version 3 expands the original 31-ticker prototype into a governed **Global 360** universe and lets the user define what the monkey is allowed to hit.

## Version 3 capabilities

- Governed 360-security source split across five reviewable regional files
- Global, stocks-only, regional, ETF and innovation presets
- Region, sector, size-band, instrument and text filters
- Dynamic equal-probability proof for every valid active universe
- Cryptographic Fisher–Yates shuffle before every throw
- Rejection sampling to remove modulo bias
- Single, 10, 100 and 1,000-throw simulation modes
- Dynamic expected coverage, entropy, chi-square and p-value analysis
- Observed-versus-universe region, sector, size and instrument diagnostics
- Audit mode for the current 25-card deal
- Exportable experiment ledger
- Responsive, dependency-free browser interface

## Probability model

For an active universe containing `N` eligible securities:

```text
P(selection) = P(dealt) × P(hit | dealt)
             = 25/N × 1/25
             = 1/N
```

Changing a preset or filter creates a new active universe and resets the experiment. The simulator requires at least 25 eligible securities.

## Governed data sources

The source universe is split by region so additions and corrections remain easy to review:

```text
data/global360/source-north-america.json
data/global360/source-europe.json
data/global360/source-asia-pacific.json
data/global360/source-emerging-markets.json
data/global360/source-etfs.json
```

Each record currently contains:

```text
ticker | name | sector | industry | size band
```

The browser data loader adds market-group, country, region, exchange, currency and instrument classifications. The governed Excel security master remains the editorial source of truth for future enrichment.

## Application structure

```text
index.html       redirects to the current V3 release
v3.html          semantic interface
styles.css       core cinematic design system
v3.css           Global 360 controls and analytics
v3-data.js       source loading, parsing and presets
v3-engine.js     randomness, probability and statistics
v3-ui.js         filters, interactions, charts and CSV export
scripts/validate-universe.js
```

The original `app.js` and `tickers.js` files are retained as historical prototype code.

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

## Data maturity

Global 360 is a curated beta research universe. Size bands are design classifications rather than live calculations. Stable identifiers, live market capitalisation, liquidity, corporate-action handling and return tracking remain planned enrichment layers.

## Disclaimer

Monkey 26 is an educational statistical experiment. It does not provide investment advice, recommendations or live market data.

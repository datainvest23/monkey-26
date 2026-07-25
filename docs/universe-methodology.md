# Monkey 26 — Global 360 Universe

**Version:** `G360-2026Q3-v0.1`  
**Snapshot date:** 25 July 2026  
**Status:** Controlled research draft

## What this adds

The original 31-line watchlist has been expanded into a governed universe of **360 instruments**:

| Segment | Instruments |
|---|---:|
| North America | 120 |
| Europe | 90 |
| Asia-Pacific | 75 |
| Emerging Markets | 45 |
| Global and thematic ETFs | 30 |
| **Total** | **360** |

The dataset covers **330 equities, 30 ETFs, 32 countries, 35 exchanges and 107 industry labels**.

## Probability model

In Pure Monkey mode, all active instruments remain exactly equiprobable.

1. Shuffle all `N` active instruments.
2. Deal 25 hidden cards.
3. Select one of the 25 cells uniformly.

Therefore:

```text
P(instrument selected) = 25/N × 1/25 = 1/N
```

For this release, each instrument receives probability **1/360 per throw**.

## Identifier policy

Ticker alone is not treated as a unique identifier. The master key is:

```text
MIC_CODE:TICKER
```

Examples:

```text
XNAS:AAPL
XLON:AZN
XETR:SAP
XTKS:7203
XHKG:0700
```

`provider_symbol` is stored separately because vendor symbol syntax is provider-specific.

## Data-governance position

This release is deliberately honest about its maturity:

- Geographic and sector coverage are ready for research use.
- Identifiers are structured and duplicate-checked.
- `market_cap_usd` is intentionally blank.
- Market-cap buckets are preliminary design classifications.
- ETF AUM and expense ratios still require issuer/API enrichment.
- Every row retains source and quote-verification URLs.

This avoids false precision while giving the application a production-oriented schema.

## Required production enrichment

Before using the universe for live return tracking or investment research:

1. Connect an approved market-data provider.
2. Populate market capitalisation and ETF AUM.
3. Recalculate size buckets from documented thresholds.
4. Confirm listing status and primary-listing flags.
5. Resolve provider-specific symbols.
6. Store the provider, timestamp and refresh result.
7. Close the mid-, small- and micro-cap representation gap.

## Files

- `data/global-360-app-v0.1.js` — compact browser-ready universe.
- `scripts/validate-universe.js` — structural validation for Node.js or CI.
- The governed Excel security master is maintained as the editorial source of truth.

## Recommended application modes

- **Pure Monkey:** every enabled instrument has equal probability.
- **Balanced Monkey:** region → sector → size band → instrument.
- **Market Monkey:** market-cap-weighted selection after enrichment.
- **Custom Monkey:** user-selected filters and exclusions.

## Disclaimer

This dataset and simulator are educational and research tools. They are not investment advice, and inclusion is not a recommendation to buy or sell any security.

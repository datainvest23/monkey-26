# Monkey 26 — Global Random Pick Lab

A cinematic, filterable implementation of Burton Malkiel's blindfolded-monkey thought experiment.

Version 3 expands the original 31-ticker prototype into a governed **Global 360** universe and lets the user define what the monkey is allowed to hit.

## What actually ships

The application uses an ES module architecture consisting of:
- \`index.html\` (the static shell)
- \`styles.css\` (single stylesheet)
- \`shared-data.js\`, \`data.js\`, \`engine.js\`, \`ui.js\`, \`animation.js\` (ES modules)

The engine provides a direct 1/n draw with rejection sampling, maintaining mathematical fairness.

Known limitations:
- Large-cap concentration (338 of 360).
- Probability is uniform across listings rather than issuers.
- Price fields are unpopulated.
- The provisional p-value is below 5n throws.

## Run locally

Because the universe is loaded through \`fetch\`, serve the repository through a local web server:

\`\`\`bash
python -m http.server 8000
\`\`\`

Then open \`http://localhost:8000\`.

## Validate the Global 360 source

\`\`\`bash
node scripts/validate-universe.js
\`\`\`

The validator checks source-file availability, field structure, record count, mandatory values and group/ticker uniqueness.

## Run Engine Tests

\`\`\`bash
node --test engine.test.js
\`\`\`

## Disclaimer

Monkey 26 is an educational statistical experiment. It does not provide investment advice, recommendations or live market data.

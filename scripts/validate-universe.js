import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { data } from '../shared-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.argv[2] || path.join(__dirname, '..', 'data', 'global360');

const rows = [];
const errors = [];
const groupCounts = {};
const sizeBands = {};
const sectors = {};

for (const file of data.sources) {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`missing source file: ${file}`);
    continue;
  }
  let groups;
  try {
    groups = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch(e) {
    errors.push(`failed to parse JSON in ${file}: ${e.message}`);
    continue;
  }

  try {
    const parsedRows = data.parse(file, groups);
    for (const row of parsedRows) {
      rows.push(row);
      groupCounts[row.group] = (groupCounts[row.group] || 0) + 1;
      sizeBands[row.size] = (sizeBands[row.size] || 0) + 1;
      sectors[row.sector] = (sectors[row.sector] || 0) + 1;
    }
  } catch(e) {
    errors.push(e.message);
  }
}

// Check for cross-group ticker collisions
// The requirement says: "flag cross-group ticker collisions (RIO currently appears in both the Australia and UK groups as the same dual-listed issuer)"
const tickerGroups = {};
for (const row of rows) {
  if (!tickerGroups[row.ticker]) tickerGroups[row.ticker] = new Set();
  tickerGroups[row.ticker].add(row.group);
}

for (const [ticker, groups] of Object.entries(tickerGroups)) {
  if (groups.size > 1) {
    errors.push(`cross-group ticker collision: ticker ${ticker} appears in groups ${Array.from(groups).join(', ')}`);
  }
}

// Check exact duplicate IDs
const keys = new Set();
for (const row of rows) {
  const key = row.id;
  if (keys.has(key)) errors.push(`duplicate group/ticker ID: ${key}`);
  keys.add(key);
}

if (rows.length !== 360) errors.push(`expected 360 records; found ${rows.length}`);

console.log(JSON.stringify({
  version: data.meta.version,
  records: rows.length,
  uniqueTickers: Object.keys(tickerGroups).length,
  sourceFiles: data.sources.length,
  groups: groupCounts,
  sectors,
  sizeBands,
  errors: errors.length,
}, null, 2));

if (errors.length) {
  console.error('\nVALIDATION FAILED');
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nVALIDATION PASSED');


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

// Basic structural schema validation
function validateSchemaStruct(groups, file) {
  if (typeof groups !== 'object' || groups === null || Array.isArray(groups)) {
    return `Root must be an object in ${file}`;
  }
  for (const [groupName, groupData] of Object.entries(groups)) {
    if (!/^[a-z_]+$/.test(groupName)) {
      return `Invalid group name '${groupName}' in ${file}`;
    }
    if (!Array.isArray(groupData)) {
      return `Group '${groupName}' must be an array in ${file}`;
    }
    for (let i = 0; i < groupData.length; i++) {
      const item = groupData[i];
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return `Item ${i} in group '${groupName}' must be an object in ${file}`;
      }
      const required = ['ticker', 'name', 'sector', 'industry', 'size_band'];
      for (const req of required) {
        if (typeof item[req] !== 'string') {
          return `Missing or invalid required property '${req}' in item ${i} of group '${groupName}' in ${file}`;
        }
      }
      for (const key of Object.keys(item)) {
        if (![...required, 'price', 'return_pct'].includes(key)) {
          return `Unknown property '${key}' in item ${i} of group '${groupName}' in ${file}`;
        }
      }
    }
  }
  return null;
}

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

  const schemaError = validateSchemaStruct(groups, file);
  if (schemaError) {
    errors.push(`JSON Schema validation failed: ${schemaError}`);
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
// Allow dual-listed securities if they are listed on different exchanges.
const seen = new Map();
for (const row of rows) {
  const exchange = (row.exchange || '').trim().toUpperCase();
  const key = exchange ? `${row.ticker}@${exchange}` : row.ticker;

  if (seen.has(key)) {
    const prev = seen.get(key);
    errors.push(`cross-group ticker collision: ticker ${row.ticker} (exchange: ${exchange || 'none'}) appears in groups ${prev.group}, ${row.group}`);
  } else {
    seen.set(key, row);
  }
}
const uniqueTickers = seen.size;

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
  uniqueTickers: uniqueTickers,
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

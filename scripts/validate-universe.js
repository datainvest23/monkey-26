#!/usr/bin/env node
/* Monkey 26 Global 360 source validator. */
const fs = require('fs');
const path = require('path');

const dataDir = process.argv[2] || path.join(__dirname, '..', 'data', 'global360');
const files = [
  'source-north-america.json',
  'source-europe.json',
  'source-asia-pacific.json',
  'source-emerging-markets.json',
  'source-etfs.json',
];

const rows = [];
const errors = [];
const groupCounts = {};
const sizeBands = {};
const sectors = {};

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`missing source file: ${file}`);
    continue;
  }
  const groups = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  for (const [group, block] of Object.entries(groups)) {
    const lines = String(block).split(/\r?\n/).filter(Boolean);
    groupCounts[group] = lines.length;
    for (const [index, line] of lines.entries()) {
      const fields = line.split('|');
      if (fields.length !== 5) {
        errors.push(`${file}/${group} row ${index + 1}: expected 5 fields, found ${fields.length}`);
        continue;
      }
      const [ticker, name, sector, industry, size] = fields.map(v => v.trim());
      if (![ticker, name, sector, industry, size].every(Boolean)) {
        errors.push(`${file}/${group} row ${index + 1}: blank mandatory field`);
      }
      rows.push({ file, group, ticker, name, sector, industry, size });
      sizeBands[size] = (sizeBands[size] || 0) + 1;
      sectors[sector] = (sectors[sector] || 0) + 1;
    }
  }
}

const keys = new Set();
for (const row of rows) {
  const key = `${row.group}:${row.ticker}`;
  if (keys.has(key)) errors.push(`duplicate group/ticker: ${key}`);
  keys.add(key);
}

if (rows.length !== 360) errors.push(`expected 360 records; found ${rows.length}`);

console.log(JSON.stringify({
  version: 'G360-2026Q3-v0.1',
  records: rows.length,
  uniqueGroupTickers: keys.size,
  sourceFiles: files.length,
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

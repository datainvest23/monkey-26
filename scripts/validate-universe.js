#!/usr/bin/env node
/* Monkey 26 universe structural validator. */
const path = require('path');

const universePath = process.argv[2] || path.join(__dirname, '..', 'data', 'global-360-app-v0.1.js');

global.window = {};
require(path.resolve(universePath));

const payload = global.window.MONKEY26_UNIVERSES?.global360;
if (!payload || !Array.isArray(payload.instruments)) {
  console.error('FAIL: universe payload not found.');
  process.exit(1);
}

const rows = payload.instruments;
const required = ['id', 't', 'ps', 'n', 'ty', 'x', 'mic', 'country', 'region', 'ccy', 's', 'c', 'cap'];
const errors = [];
const ids = new Set();
const providerSymbols = new Map();

for (const [index, row] of rows.entries()) {
  for (const field of required) {
    if (row[field] === undefined || row[field] === null || String(row[field]).trim() === '') {
      errors.push(`row ${index + 1}: missing ${field}`);
    }
  }
  if (ids.has(row.id)) errors.push(`row ${index + 1}: duplicate id ${row.id}`);
  ids.add(row.id);

  const providerKey = `${row.ps}|${row.x}`;
  if (providerSymbols.has(providerKey)) {
    errors.push(`row ${index + 1}: duplicate provider symbol/exchange ${providerKey}`);
  }
  providerSymbols.set(providerKey, index + 1);
}

const counts = (field) => rows.reduce((acc, row) => {
  const key = row[field] || '(blank)';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  version: payload.meta?.version,
  records: rows.length,
  uniqueIds: ids.size,
  assetTypes: counts('ty'),
  regions: counts('region'),
  sectors: counts('s'),
  sizeBands: counts('cap'),
  errors: errors.length,
}, null, 2));

if (rows.length !== 360) errors.push(`expected 360 records; found ${rows.length}`);
if (errors.length) {
  console.error('\nVALIDATION FAILED');
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nVALIDATION PASSED');

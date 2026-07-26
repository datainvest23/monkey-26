import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine, defaultRandom, logGamma, gammaQ } from './engine.js';

test('logGamma reference values', () => {
  assert.ok(Math.abs(logGamma(1) - 0) < 1e-6);
  assert.ok(Math.abs(logGamma(2) - 0) < 1e-6);
  assert.ok(Math.abs(logGamma(3) - Math.log(2)) < 1e-6);
  assert.ok(Math.abs(logGamma(0.5) - Math.log(Math.sqrt(Math.PI))) < 1e-6);
});

test('gammaQ reference values', () => {
  assert.equal(gammaQ(1, 0), 1);
  assert.ok(Math.abs(gammaQ(1, 1) - 0.367879) < 1e-5);
});

test('Engine rand with seeded generator', () => {
  let counter = 0;
  const seededRng = {
    getUint32: () => {
      const val = counter++;
      return { val, crypto: true };
    }
  };
  const engine = new Engine(seededRng);
  assert.equal(engine.rand(3), 0);
  assert.equal(engine.rand(3), 1);
  assert.equal(engine.rand(3), 2);
  assert.equal(engine.rand(3), 0);
});

test('Engine rejection sampling bounds', () => {
  let values = [];
  const fakeRng = {
    getUint32: () => {
      return { val: values.shift(), crypto: true };
    }
  };
  const engine = new Engine(fakeRng);
  const n = 3;
  const limit = Math.floor(4294967296 / n) * n;
  values.push(limit);
  values.push(5);
  const result = engine.rand(n);
  assert.equal(result, 2);
  assert.equal(engine.rng.rejections, 1);
  assert.equal(engine.rng.calls, 2);
});

test('Engine uniformity over large N', () => {
  let state = 12345;
  const prng = {
    getUint32: () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return { val: state, crypto: true };
    }
  };
  const engine = new Engine(prng);
  const n = 10;
  const counts = Array(n).fill(0);
  const trials = 10000;
  for (let i = 0; i < trials; i++) {
    counts[engine.rand(n)]++;
  }
  const expected = trials / n;
  for (const c of counts) {
    assert.ok(Math.abs(c - expected) < expected * 0.2);
  }
});

test('Engine expected values (entropy, chi-square) and real throw()', () => {
  let rands = [];
  const prng = {
    getUint32: () => {
      if (rands.length > 0) return { val: rands.shift(), crypto: true };
      return { val: 0, crypto: true };
    }
  };

  const engine = new Engine(prng);

  const universe = [
    { id: 'A', ticker: 'A', name: 'A-Co' },
    { id: 'B', ticker: 'B', name: 'B-Co' },
    { id: 'C', ticker: 'C', name: 'C-Co' }
  ];

  engine.setUniverse(universe, 'Test');

  rands = [0, 1, 2];

  engine.throw(); // selects active[0]
  engine.throw(); // selects active[1]
  engine.throw(); // selects active[2]

  assert.equal(engine.throws, 3);
  assert.equal(engine.counts['A'], 1);
  assert.equal(engine.counts['B'], 1);
  assert.equal(engine.counts['C'], 1);

  assert.equal(engine.chi(), 0);
  assert.equal(engine.pValue(), 1);
  assert.ok(Math.abs(engine.entropy() - 1) < 1e-6);
});

test('Engine non-crypto fallback', () => {
  const prng = {
    getUint32: () => {
      return { val: 123, crypto: false };
    }
  };
  const engine = new Engine(prng);
  assert.equal(engine.rand(10), 3);
  assert.equal(engine.rng.last.crypto, false);
});

test('CSV escaping', () => {
  const engine = new Engine();
  engine.active = [
    {
      id: 'A', ticker: 'A,B', name: 'Company "Quotes"', assetType: 'Stock', group: 'US',
      country: 'US', region: 'NA', exchange: 'NYSE', currency: 'USD',
      sector: 'Tech\nLine', industry: 'Soft', size: 'Large', version: '1.0'
    }
  ];
  engine.throws = 1;
  engine.ledger = [
    {
      no: 1, spread: 1, page: 1, line: 1, side: 'left', location: 'P1 L1',
      security: engine.active[0], selectionIndex: 0, universeSize: 1, universeLabel: 'Test',
      version: '1.0', editionCalls: 0, rng: {raw:0, index:0, rejections:0, crypto:true}
    }
  ];
  const csv = engine.csv();
  assert.ok(csv.includes('"A,B"'));
  assert.ok(csv.includes('"Company ""Quotes"""'));
  assert.ok(csv.includes('"Tech\nLine"'));
});

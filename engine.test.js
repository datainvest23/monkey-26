import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine, defaultRandom, logGamma, gammaQ } from './engine.js';

test('logGamma reference values', () => {
  // logGamma(1) = 0
  assert.ok(Math.abs(logGamma(1) - 0) < 1e-6);
  // logGamma(2) = 0
  assert.ok(Math.abs(logGamma(2) - 0) < 1e-6);
  // logGamma(3) = log(2)
  assert.ok(Math.abs(logGamma(3) - Math.log(2)) < 1e-6);
  // logGamma(0.5) = log(sqrt(pi))
  assert.ok(Math.abs(logGamma(0.5) - Math.log(Math.sqrt(Math.PI))) < 1e-6);
});

test('gammaQ reference values', () => {
  // gammaQ(a, 0) should be 1
  assert.equal(gammaQ(1, 0), 1);
  // Some standard points
  assert.ok(Math.abs(gammaQ(1, 1) - 0.367879) < 1e-5);
});

test('Engine rand with seeded generator', () => {
  let counter = 0;
  // A simple cyclic generator that will return predictable values.
  const seededRng = {
    getUint32: () => {
      // Return 0, 1, 2, ...
      const val = counter++;
      return { val, crypto: true };
    }
  };

  const engine = new Engine(seededRng);

  // Ask for rand(3)
  // Calls to generator:
  // r = 0, limit = floor(2^32 / 3) * 3 = 1431655765 * 3 = 4294967295
  // r=0 < 4294967295, so loop breaks, returns 0 % 3 = 0.
  assert.equal(engine.rand(3), 0);
  // Next val = 1
  assert.equal(engine.rand(3), 1);
  // Next val = 2
  assert.equal(engine.rand(3), 2);
  // Next val = 3
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
  const limit = Math.floor(4294967296 / n) * n; // 4294967295

  // Seed with a value >= limit, then a valid value.
  values.push(limit); // Will be rejected
  values.push(5);     // Valid, 5 % 3 = 2

  const result = engine.rand(n);
  assert.equal(result, 2);
  assert.equal(engine.rng.rejections, 1);
  assert.equal(engine.rng.calls, 2);
});

test('Engine expected values (entropy, chi-square, CSV)', () => {
  // We'll stub rand on the engine to return 0, 1, 2 for the picks,
  // and 0 for everything else (shuffles).
  class TestEngine extends Engine {
    constructor() {
      super({ getUint32: () => ({ val: 0, crypto: true }) });
      this.randCounter = 0;
      this.inThrowPick = false;
    }
    rand(n) {
      this.rng.calls++;
      this.rng.last = { raw: -1, index: -1, rejections: 0, crypto: true };
      if (this.inThrowPick) {
        return this.randCounter++;
      }
      return 0;
    }
    throw() {
      if (!this.active.length) throw new Error('At least one eligible security is required');
      this.inThrowPick = true;
      let pick = this.rand(this.active.length);
      this.inThrowPick = false;
      let selectionRng = Object.assign({}, this.rng.last);
      let security = this.active[pick];
      let editionCalls = this.newEdition();
      let position = this.edition.findIndex(d => d.id === security.id);
      let spread = Math.floor(position / this.pageSize) + 1;
      let within = position % this.pageSize;
      let side = within < 12 ? 'left' : 'right';
      let page = (spread - 1) * 2 + (side === 'left' ? 1 : 2);
      let line = within % 12 + 1;
      this.throws++;
      this.counts[security.id] = (this.counts[security.id] || 0) + 1;
      let row = {
        no: this.throws,
        spread: spread,
        page: page,
        line: line,
        side: side,
        location: 'P' + page + ' · L' + line,
        security: security,
        selectionIndex: pick,
        universeSize: this.active.length,
        universeLabel: this.label,
        version: this.dataVersion,
        editionCalls: editionCalls,
        rng: selectionRng
      };
      this.ledger.unshift(row);
      return row;
    }
  }

  const engine = new TestEngine();

  // Create dummy universe of 3
  const universe = [
    { id: 'A', ticker: 'A', name: 'A-Co' },
    { id: 'B', ticker: 'B', name: 'B-Co' },
    { id: 'C', ticker: 'C', name: 'C-Co' }
  ];

  engine.setUniverse(universe, 'Test');

  // throw 3 times
  engine.throw(); // selects id A
  engine.throw(); // selects id B
  engine.throw(); // selects id C

  assert.equal(engine.throws, 3);
  // Each selected exactly once
  assert.equal(engine.counts['A'], 1);
  assert.equal(engine.counts['B'], 1);
  assert.equal(engine.counts['C'], 1);

  // expected freq = 1
  // chi-square = sum((obs-exp)^2 / exp) = 0 + 0 + 0 = 0
  assert.equal(engine.chi(), 0);

  // p-value: n=3, df=2. p = gammaQ(1, 0/2) = 1
  assert.equal(engine.pValue(), 1);

  // entropy = - sum(p log p) = - 3 * (1/3 log(1/3))
  // max entropy = log(3)
  // normalised = (- 1/3 log(1/3) * 3) / log(3) = 1
  assert.ok(Math.abs(engine.entropy() - 1) < 1e-6);

  // CSV output checks
  const csv = engine.csv();
  assert.ok(csv.includes('throw,page,line,security_id,ticker,name,asset_type,market_group,country,region,exchange,currency,sector,industry,size_band,selection_index,universe_size,universe_label,version'));
  assert.ok(csv.includes('A-Co'));
  assert.ok(csv.includes('B-Co'));
  assert.ok(csv.includes('C-Co'));
});

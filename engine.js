export function logGamma(z){
  var c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
  if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
  z--;
  var x=.9999999999998099;
  for(var i=0;i<c.length;i++)x+=c[i]/(z+i+1);
  var t=z+c.length-.5;
  return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
}

export function gammaQ(a,x){
  if(x<0||a<=0)return NaN;
  if(x===0)return 1;
  var gl=logGamma(a),eps=1e-12,max=300;
  if(x<a+1){
    var ap=a,del=1/a,sum=del;
    for(var n=1;n<=max;n++){
      ap++;
      del*=x/ap;
      sum+=del;
      if(Math.abs(del)<Math.abs(sum)*eps)break;
    }
    return Math.max(0,Math.min(1,1-sum*Math.exp(-x+a*Math.log(x)-gl)));
  }
  var b=x+1-a,c=1e300,d=1/b,h=d;
  for(var i=1;i<=max;i++){
    var an=-i*(i-a);
    b+=2;
    d=an*d+b;
    if(Math.abs(d)<1e-300)d=1e-300;
    c=b+an/c;
    if(Math.abs(c)<1e-300)c=1e-300;
    d=1/d;
    var q=d*c;
    h*=q;
    if(Math.abs(q-1)<eps)break;
  }
  return Math.max(0,Math.min(1,Math.exp(-x+a*Math.log(x)-gl)*h));
}

// Default random implementation utilizing crypto.getRandomValues if available
export const defaultRandom = {
  getUint32: function() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return { val: buf[0], crypto: true };
    }
    // Fallback if crypto isn't available
    return { val: Math.floor(Math.random() * 4294967296), crypto: false };
  }
};

export class Engine {
  constructor(randomProvider = defaultRandom) {
    this.randomProvider = randomProvider;
    this.pageSize = 24;
    this.active = [];
    this.edition = [];
    this.ledger = [];
    this.throws = 0;
    this.counts = {};
    this.label = 'Global 360';
    this.rng = { calls: 0, rejections: 0, last: null };
    this.dataVersion = 'G360-2026Q3-v0.1';
  }

  rand(n) {
    if (!Number.isInteger(n) || n < 1) throw new Error('Random range must be a positive integer');
    let r, rej = 0;
    let limit = Math.floor(4294967296 / n) * n;
    let result;
    do {
      result = this.randomProvider.getUint32();
      r = result.val;
      this.rng.calls++;
      if (!result.crypto) {
        // We only use standard rejection sampling logic on secure random values.
        // For Math.random() fallback, we just return the direct value to match old behavior.
        this.rng.last = { raw: -1, index: r % n, rejections: 0, crypto: false };
        return r % n;
      }
      if (r >= limit) {
        rej++;
        this.rng.rejections++;
      }
    } while (r >= limit);

    this.rng.last = { raw: r, index: r % n, rejections: rej, crypto: true };
    return r % n;
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      let j = this.rand(i + 1);
      let t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  reset() {
    this.edition = [];
    this.ledger = [];
    this.throws = 0;
    this.counts = {};
    this.rng = { calls: 0, rejections: 0, last: null };
    if (this.active && this.active.length) this.newEdition();
  }

  setUniverse(rows, label) {
    this.active = rows.slice();
    this.label = label;
    this.reset();
    if (rows.length) this.newEdition();
  }

  newEdition() {
    let before = this.rng.calls;
    this.edition = this.shuffle(this.active.slice());
    return this.rng.calls - before;
  }

  throw() {
    if (!this.active.length) throw new Error('At least one eligible security is required');
    let pick = this.rand(this.active.length);
    let selectionRng = Object.assign({}, this.rng.last);
    let security = this.active[pick];
    // Decouple shuffle from draw: shuffle once per edition, not per throw.
    // If edition is empty or we reached the end of the current edition, shuffle a new one.
    // However, the rules specify: "shuffle once per edition, not per throw".
    // We already shuffle in setUniverse -> newEdition().
    // We will just find the position in the current edition.
    // BUT, wait, the "dart" is thrown directly at the active array, so the position in the edition doesn't matter for probability,
    // it just determines the page/line representation.
    let editionCalls = 0; // We no longer shuffle per throw
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

    this.ledger.push(row);
    return row;
  }

  batch(n) {
    let last;
    for (let i = 0; i < n; i++) last = this.throw();
    return last;
  }

  expectedDistinct() {
    let n = this.active.length;
    return n && this.throws ? n * (1 - Math.pow((n - 1) / n, this.throws)) : 0;
  }

  entropy() {
    if (this.throws < 2) return null;
    let h = 0;
    Object.keys(this.counts).forEach(k => {
      let p = this.counts[k] / this.throws;
      h -= p * Math.log(p);
    });
    let max = Math.log(Math.min(this.active.length, this.throws));
    return max ? h / max : null;
  }

  chi() {
    if (!this.throws || !this.active.length) return null;
    let expected = this.throws / this.active.length, sum = 0;
    this.active.forEach(d => {
      let diff = (this.counts[d.id] || 0) - expected;
      sum += diff * diff / expected;
    });
    return sum;
  }

  pValue() {
    let n = this.active.length;
    if (this.throws < n || n < 2) return null;
    return gammaQ((n - 1) / 2, this.chi() / 2);
  }

  csv() {
    function q(v) {
      v = String(v == null ? '' : v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    let h = ['throw', 'page', 'line', 'security_id', 'ticker', 'name', 'asset_type', 'market_group', 'country', 'region', 'exchange', 'currency', 'sector', 'industry', 'size_band', 'selection_index', 'universe_size', 'universe_label', 'version'];
    let b = this.ledger.map(r => {
      let d = r.security;
      return [r.no, r.page, r.line, d.id, d.ticker, d.name, d.assetType, d.group, d.country, d.region, d.exchange, d.currency, d.sector, d.industry, d.size, r.selectionIndex, r.universeSize, r.universeLabel, r.version].map(q).join(',');
    });
    return [h.join(',')].concat(b).join('\n');
  }
}

export const engine = new Engine();

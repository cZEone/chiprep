// Run: node test/calc.test.js
// Checks the calculator against every row of the original Excel sheet (v2.6)
// plus hand-worked Bao / Bao Limit / Zha Hu cases from the sheet's formulas.
const assert = require('assert');
const MJ = require('../calc.js');
const fx = require('./excel-fixture.json');

const settings = { rates: MJ.PRESETS['0.3/0.6'].rates, gang: 1, angang: 2 };
const idx = (n) => fx.players.indexOf(n);

function rowToEvent(r) {
  if (r.winner === 'All' || r.winner === 'ALL') return { type: 'zhahu', player: idx(r.thrower) };
  if (r.tai === 'BAO') return { type: 'bao', player: idx(r.winner), thrower: idx(r.thrower) };
  if (r.tai === 'BAOLIMIT') return { type: 'baolimit', player: idx(r.winner), thrower: idx(r.thrower) };
  if (r.thrower === 'ZIMO') return { type: 'zimo', player: idx(r.winner), tai: r.tai };
  if (r.thrower === 'GANG') return { type: 'gang', player: idx(r.winner) };
  if (r.thrower === 'AN GANG') return { type: 'angang', player: idx(r.winner) };
  return { type: 'discard', player: idx(r.winner), thrower: idx(r.thrower), tai: r.tai };
}

const events = fx.rows.map(rowToEvent);
fx.rows.forEach((r, i) => {
  const d = MJ.computeDeltas(settings, events[i]).map((c) => c / 100);
  assert.deepStrictEqual(d, r.expected, `row ${i + 2}: ${JSON.stringify(r)} got ${d}`);
});
assert.deepStrictEqual(MJ.totals(settings, events).map((c) => c / 100), fx.totals);

// Bao: thrower pays 2 x $10 + $20 = $40 alone
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'bao', player: 0, thrower: 2 }), [4000, 0, -4000, 0]);
// Bao Limit: thrower pays 3 x $20 = $60 alone
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'baolimit', player: 1, thrower: 3 }), [0, 6000, 0, -6000]);
// Zha Hu: offender pays $20 to each other player
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'zhahu', player: 3 }), [2000, 2000, 2000, -6000]);
// 0.1/0.2 preset: 5 tai discard = 2 x 1.6 + 3.2 = 6.40, no float drift
const s2 = { rates: MJ.PRESETS['0.1/0.2'].rates, gang: 0.1, angang: 0.2 };
assert.deepStrictEqual(MJ.computeDeltas(s2, { type: 'discard', player: 0, thrower: 1, tai: 5 }), [640, -320, -160, -160]);
// Shooter mode: 3 tai discard, thrower pays $5 + $3 + $3 = $11 alone
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'discard', player: 0, thrower: 1, tai: 3, shooter: true }), [1100, -1100, 0, 0]);
// Shooter mode does not change 自摸 or 杠
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'zimo', player: 0, tai: 1, shooter: true }), [600, -200, -200, -200]);
// Shooter mode 杠: the thrower pays all three shares; 暗杠 is unchanged
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'gang', player: 2, thrower: 0, shooter: true }), [-300, 0, 300, 0]);
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'angang', player: 2, shooter: true }), [-200, -200, 600, -200]);
assert.ok(MJ.needsThrower({ type: 'gang', shooter: true }) && !MJ.needsThrower({ type: 'gang' }) && !MJ.needsThrower({ type: 'angang', shooter: true }));
// Older shooter 杠 hands saved without a thrower: everyone pays
assert.deepStrictEqual(MJ.computeDeltas(settings, { type: 'gang', player: 2, thrower: null, shooter: true }), [-100, -100, 300, -100]);
// Validation: nobody picked (null) must be rejected
['gang', 'angang', 'zimo', 'zhahu'].forEach((type) =>
  assert.throws(() => MJ.computeDeltas(settings, { type, player: null, thrower: null, tai: 1 }), /Pick a player/));
assert.throws(() => MJ.computeDeltas(settings, { type: 'discard', player: 0, thrower: null, tai: 1 }), /Pick who threw/);
assert.throws(() => MJ.computeDeltas(settings, { type: 'bao', player: 0, thrower: null }), /Pick who threw/);
assert.throws(() => MJ.computeDeltas(settings, { type: 'discard', player: 0, thrower: 0, tai: 1 }));
assert.throws(() => MJ.computeDeltas(settings, { type: 'zimo', player: 0 }));
// Settle-up nets to zero
const tot = MJ.totals(settings, events);
const bal = tot.slice();
MJ.settle(tot).forEach((p) => { bal[p.from] += p.cents; bal[p.to] -= p.cents; });
assert.deepStrictEqual(bal, [0, 0, 0, 0]);

console.log(`OK: ${fx.rows.length} Excel rows match, totals ${fx.totals.join(', ')}`);

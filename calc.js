/*
 * Mahjong chip calculation core.
 * All money is handled in integer cents to avoid floating point drift.
 * Works in the browser (window.MJ) and in Node (module.exports) for tests.
 */
(function (root) {
  'use strict';

  var MAX_TAI = 5;

  // Built-in rate presets: [1st rate, 2nd rate] per tai (index 0 = 1 tai).
  var PRESETS = {
    '0.3/0.6': {
      label: '0.3 / 0.6',
      rates: [[1, 2], [2, 3], [3, 5], [5, 10], [10, 20]],
    },
    '0.1/0.2': {
      label: '0.1 / 0.2',
      rates: [[0.1, 0.2], [0.2, 0.4], [0.4, 0.8], [0.8, 1.6], [1.6, 3.2]],
    },
  };

  var TYPES = {
    discard:  { label: 'Win',      short: 'Win',      needsThrower: true,  needsTai: true },
    zimo:     { label: '自摸',     short: '自摸',     needsThrower: false, needsTai: true },
    gang:     { label: '杠',       short: '杠',       needsThrower: false, needsTai: false },
    angang:   { label: '暗杠',     short: '暗杠',     needsThrower: false, needsTai: false },
    bao:      { label: '包',       short: '包',       needsThrower: true,  needsTai: false },
    baolimit: { label: '包 Limit', short: '包 Limit', needsThrower: true,  needsTai: false },
    zhahu:    { label: '诈胡',     short: '诈胡',     needsThrower: false, needsTai: false },
  };

  function toCents(x) { return Math.round(Number(x) * 100); }

  /**
   * Compute the per-player change (in cents) for one event.
   * settings: { rates: [[first, second] x5] (dollars), gang: dollars, angang: dollars }
   * ev: { type, player, thrower, tai }
   *   player  = winner / gang declarer / zha hu offender (index 0-3)
   *   thrower = player who threw the tile (discard, bao, bao limit)
   * Returns an array of 4 integers summing to zero, or throws on invalid input.
   */
  function computeDeltas(settings, ev) {
    var t = TYPES[ev.type];
    if (!t) throw new Error('Unknown event type: ' + ev.type);
    var p = ev.player;
    if (!(p >= 0 && p < 4)) throw new Error('Pick a player');
    var d = [0, 0, 0, 0];
    var rate = function (tai, which) { return toCents(settings.rates[tai - 1][which]); };
    var thrower = ev.thrower;
    if (t.needsThrower) {
      if (!(thrower >= 0 && thrower < 4)) throw new Error('Pick who threw the tile');
      if (thrower === p) throw new Error('Thrower cannot be the winner');
    }
    var tai = Number(ev.tai);
    if (t.needsTai && !(tai >= 1 && tai <= MAX_TAI)) throw new Error('Pick the tai');

    var i;
    switch (ev.type) {
      case 'discard':
        // Thrower pays the 2nd rate, the other two pay the 1st rate.
        for (i = 0; i < 4; i++) {
          if (i === p) continue;
          var amt = i === thrower ? rate(tai, 1) : rate(tai, 0);
          d[i] -= amt; d[p] += amt;
        }
        break;
      case 'zimo':
        for (i = 0; i < 4; i++) {
          if (i === p) continue;
          d[i] -= rate(tai, 1); d[p] += rate(tai, 1);
        }
        break;
      case 'gang':
      case 'angang':
        var g = toCents(ev.type === 'gang' ? settings.gang : settings.angang);
        for (i = 0; i < 4; i++) {
          if (i === p) continue;
          d[i] -= g; d[p] += g;
        }
        break;
      case 'bao':
        // Thrower pays for everyone at max tai, as a discard win: 2 x 1st + 2nd.
        var bao = 2 * rate(MAX_TAI, 0) + rate(MAX_TAI, 1);
        d[thrower] -= bao; d[p] += bao;
        break;
      case 'baolimit':
        // Thrower pays for everyone at max tai, as a 自摸: 3 x 2nd.
        var lim = 3 * rate(MAX_TAI, 1);
        d[thrower] -= lim; d[p] += lim;
        break;
      case 'zhahu':
        // Offender pays each of the other three the max tai 2nd rate.
        for (i = 0; i < 4; i++) {
          if (i === p) continue;
          d[i] += rate(MAX_TAI, 1); d[p] -= rate(MAX_TAI, 1);
        }
        break;
    }
    return d;
  }

  function totals(settings, events) {
    var tot = [0, 0, 0, 0];
    events.forEach(function (ev) {
      var d = computeDeltas(settings, ev);
      for (var i = 0; i < 4; i++) tot[i] += d[i];
    });
    return tot;
  }

  /** Per-player counts for the night summary. */
  function stats(settings, events) {
    var s = [0, 1, 2, 3].map(function () {
      return { net: 0, wins: 0, zimo: 0, discardWins: 0, gang: 0, angang: 0,
               thrown: 0, bao: 0, zhahu: 0, biggestWin: 0, tai: 0 };
    });
    events.forEach(function (ev) {
      var d = computeDeltas(settings, ev);
      for (var i = 0; i < 4; i++) s[i].net += d[i];
      var w = s[ev.player];
      switch (ev.type) {
        case 'discard': w.wins++; w.discardWins++; w.tai += Number(ev.tai); s[ev.thrower].thrown++; break;
        case 'zimo': w.wins++; w.zimo++; w.tai += Number(ev.tai); break;
        case 'gang': w.gang++; break;
        case 'angang': w.angang++; break;
        case 'bao': case 'baolimit': w.wins++; s[ev.thrower].bao++; break;
        case 'zhahu': w.zhahu++; break;
      }
      if (d[ev.player] > w.biggestWin) w.biggestWin = d[ev.player];
    });
    return s;
  }

  /** Minimal-ish list of payments to settle up: [{from, to, cents}]. */
  function settle(tot) {
    var debtors = [], creditors = [];
    tot.forEach(function (c, i) {
      if (c < 0) debtors.push({ i: i, amt: -c });
      else if (c > 0) creditors.push({ i: i, amt: c });
    });
    var out = [];
    while (debtors.length && creditors.length) {
      debtors.sort(function (a, b) { return b.amt - a.amt; });
      creditors.sort(function (a, b) { return b.amt - a.amt; });
      var dd = debtors[0], cc = creditors[0];
      var pay = Math.min(dd.amt, cc.amt);
      out.push({ from: dd.i, to: cc.i, cents: pay });
      dd.amt -= pay; cc.amt -= pay;
      if (!dd.amt) debtors.shift();
      if (!cc.amt) creditors.shift();
    }
    return out;
  }

  function fmt(cents, signed) {
    var neg = cents < 0;
    var abs = Math.abs(cents);
    var s = (abs % 100 === 0) ? String(abs / 100) : (abs / 100).toFixed(2);
    if (neg) return '−$' + s;
    return (signed && cents > 0 ? '+$' : '$') + s;
  }

  var api = { MAX_TAI: MAX_TAI, PRESETS: PRESETS, TYPES: TYPES, toCents: toCents,
              computeDeltas: computeDeltas, totals: totals, stats: stats, settle: settle, fmt: fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MJ = api;
})(this);

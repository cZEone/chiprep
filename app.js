/* MJ Chips — UI. Depends on calc.js (window.MJ). */
(function () {
  'use strict';

  var STORE_KEY = 'mj-chips-v1';
  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');

  // ---------- Persistence ----------
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object') return { current: s.current || null, archive: s.archive || [] };
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    return { current: null, archive: [] };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }
  var store = load();

  // ---------- UI state ----------
  var ui = {
    tab: 'record',
    form: blankForm(),
    editingId: null,
    setup: null,
  };
  function blankForm() { return { type: 'discard', player: null, thrower: null, tai: null }; }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fmt(c, signed) { return MJ.fmt(c, signed); }
  function cls(c) { return c > 0 ? 'pos' : c < 0 ? 'neg' : 'muted'; }
  function money(x) { return fmt(MJ.toCents(x)); }
  function night() { return store.current; }
  function settingsOf(n) { return { rates: n.rates, gang: n.gang, angang: n.angang }; }
  function rateLabel(n) {
    return n.presetKey && MJ.PRESETS[n.presetKey] ? MJ.PRESETS[n.presetKey].label : 'Custom';
  }
  function dateStr(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function timeStr(ts) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function describe(n, ev) {
    var P = function (i) { return '<b>' + esc(n.players[i]) + '</b>'; };
    switch (ev.type) {
      case 'discard': return P(ev.player) + ' won ' + ev.tai + ' tai off ' + P(ev.thrower);
      case 'zimo': return P(ev.player) + ' zi mo ' + ev.tai + ' tai';
      case 'gang': return P(ev.player) + ' gang';
      case 'angang': return P(ev.player) + ' an gang';
      case 'bao': return P(ev.player) + ' won · Bao by ' + P(ev.thrower);
      case 'baolimit': return P(ev.player) + ' won · Bao Limit by ' + P(ev.thrower);
      case 'zhahu': return P(ev.player) + ' zha hu';
    }
    return '';
  }

  var showToastTimer = null;
  function toast(msg, actionLabel, action) {
    clearTimeout(showToastTimer);
    toastEl.innerHTML = '<span>' + msg + '</span>' + (actionLabel ? '<button type="button">' + esc(actionLabel) + '</button>' : '');
    toastEl.hidden = false;
    if (actionLabel) {
      toastEl.querySelector('button').onclick = function () { toastEl.hidden = true; action(); };
    }
    showToastTimer = setTimeout(function () { toastEl.hidden = true; }, 5000);
  }

  // ---------- Render ----------
  function render() {
    if (!night()) return renderSetup();
    var n = night();
    var tot = MJ.totals(settingsOf(n), n.events);
    var max = Math.max.apply(null, tot);
    var html = '';
    html += '<header class="topbar"><div><h1>MJ Chips</h1><div class="sub">' +
      esc(rateLabel(n)) + ' · Gang ' + money(n.gang) + ' / An Gang ' + money(n.angang) + ' · ' +
      n.events.length + ' entr' + (n.events.length === 1 ? 'y' : 'ies') + '</div></div></header>';
    html += '<section class="scores" aria-label="Scores">';
    n.players.forEach(function (p, i) {
      html += '<div class="score' + (max > 0 && tot[i] === max ? ' lead' : '') + '"><div class="name">' + esc(p) +
        '</div><div class="amt ' + cls(tot[i]) + '">' + fmt(tot[i], true) + '</div></div>';
    });
    html += '</section>';

    if (ui.tab === 'record') html += renderRecord(n);
    else if (ui.tab === 'history') html += renderHistory(n);
    else html += renderSummary(n, tot);

    html += '<nav class="tabs"><div class="inner">' +
      tabBtn('record', ui.editingId ? 'Edit' : 'Record') + tabBtn('history', 'History') + tabBtn('summary', 'Summary') +
      '</div></nav>';
    app.innerHTML = html;
  }
  function tabBtn(id, label) {
    return '<button type="button" data-tab="' + id + '"' + (ui.tab === id ? ' aria-current="page"' : '') + '>' + label + '</button>';
  }

  function renderRecord(n) {
    var f = ui.form;
    var t = MJ.TYPES[f.type];
    var h = '';
    if (ui.editingId) {
      var num = n.events.findIndex(function (e) { return e.id === ui.editingId; }) + 1;
      h += '<div class="banner" style="margin-top:16px"><span>Editing entry #' + num + '</span>' +
        '<button type="button" class="btn sm" data-act="cancel-edit">Cancel</button></div>';
    }
    h += '<h3>What happened?</h3><div class="choices c4">';
    ['discard', 'zimo', 'gang', 'angang'].forEach(function (k) { h += typeChip(k); });
    h += '</div><div class="choices c3" style="margin-top:8px">';
    ['bao', 'baolimit', 'zhahu'].forEach(function (k) { h += typeChip(k); });
    h += '</div>';

    var playerLabel = { discard: 'Winner', zimo: 'Winner', bao: 'Winner', baolimit: 'Winner',
      gang: 'Who made the gang?', angang: 'Who made the an gang?', zhahu: 'Who false-won? (pays everyone)' }[f.type];
    h += '<h3>' + playerLabel + '</h3><div class="choices c4">';
    n.players.forEach(function (p, i) {
      h += '<button type="button" class="chip" data-player="' + i + '" aria-pressed="' + (f.player === i) + '">' + esc(p) + '</button>';
    });
    h += '</div>';

    if (t.needsThrower) {
      var tl = f.type === 'discard' ? 'Who threw the tile?' : 'Who threw? (pays for everyone)';
      h += '<h3>' + tl + '</h3><div class="choices c4">';
      n.players.forEach(function (p, i) {
        h += '<button type="button" class="chip" data-thrower="' + i + '" aria-pressed="' + (f.thrower === i) + '"' +
          (f.player === i ? ' disabled' : '') + '>' + esc(p) + '</button>';
      });
      h += '</div>';
    }

    if (t.needsTai) {
      h += '<h3>Tai</h3><div class="choices c5">';
      for (var k = 1; k <= MJ.MAX_TAI; k++) {
        var r = n.rates[k - 1];
        h += '<button type="button" class="chip" data-tai="' + k + '" aria-pressed="' + (f.tai === k) + '">' + k +
          '<small>' + money(r[0]) + '/' + money(r[1]) + '</small></button>';
      }
      h += '</div>';
    }

    var hint = {
      discard: 'Thrower pays the 2nd rate, the other two pay the 1st rate.',
      zimo: 'All three pay the 2nd rate.',
      gang: 'All three pay ' + money(n.gang) + '.',
      angang: 'All three pay ' + money(n.angang) + '.',
      bao: 'Thrower pays everything at 5 tai: 2 × ' + money(n.rates[4][0]) + ' + ' + money(n.rates[4][1]) + '.',
      baolimit: 'Thrower pays everything at 5 tai: 3 × ' + money(n.rates[4][1]) + '.',
      zhahu: 'Pays each other player ' + money(n.rates[4][1]) + ' (5 tai, 2nd rate).',
    }[f.type];
    h += '<p class="hint">' + hint + '</p>';

    var deltas = null, err = null;
    try { deltas = MJ.computeDeltas(settingsOf(n), f); } catch (e) { err = e.message; }
    h += '<div class="submitbar"><div class="preview">';
    n.players.forEach(function (p, i) {
      var v = deltas ? deltas[i] : 0;
      h += '<div><div class="n">' + esc(p) + '</div><div class="v ' + (deltas ? cls(v) : 'muted') + '">' +
        (deltas ? fmt(v, true) : '–') + '</div></div>';
    });
    h += '</div>';
    h += '<button type="button" class="btn primary block" style="margin-top:10px" data-act="submit"' + (deltas ? '' : ' disabled') + '>' +
      (ui.editingId ? 'Save changes' : 'Add entry') + '</button>';
    if (!deltas && err && f.player !== null) h += '<p class="hint" style="text-align:center;margin:6px 0 0">' + esc(err) + '</p>';
    h += '</div>';
    return h;
  }
  function typeChip(k) {
    return '<button type="button" class="chip" data-type="' + k + '" aria-pressed="' + (ui.form.type === k) + '">' +
      MJ.TYPES[k].short + '</button>';
  }

  function renderHistory(n) {
    if (!n.events.length) return '<p class="empty">No entries yet. Record the first hand on the Record tab.</p>';
    var s = settingsOf(n);
    var h = '<h2>History</h2><ul class="hist">';
    for (var idx = n.events.length - 1; idx >= 0; idx--) {
      var ev = n.events[idx];
      var d = MJ.computeDeltas(s, ev);
      h += '<li' + (ev.id === ui.editingId ? ' class="editing"' : '') + '><div class="head"><span class="desc">' + describe(n, ev) +
        '<span class="tag">' + MJ.TYPES[ev.type].short + '</span></span><span class="num">#' + (idx + 1) + ' · ' + timeStr(ev.at) + '</span></div>';
      h += '<div class="deltas">';
      n.players.forEach(function (p, i) {
        h += '<span class="' + cls(d[i]) + '">' + esc(p.slice(0, 8)) + '<br>' + (d[i] ? fmt(d[i], true) : '–') + '</span>';
      });
      h += '</div><div class="actions"><button type="button" class="btn sm" data-edit="' + ev.id + '">Edit</button>' +
        '<button type="button" class="btn sm danger" data-del="' + ev.id + '">Delete</button></div></li>';
    }
    return h + '</ul>';
  }

  function renderSummary(n, tot) {
    var st = MJ.stats(settingsOf(n), n.events);
    var h = '<h2>Night summary</h2><div class="card scroll-x"><table><thead><tr><th></th>';
    n.players.forEach(function (p) { h += '<th>' + esc(p) + '</th>'; });
    h += '</tr></thead><tbody>';
    var rows = [
      ['Net', function (s) { return '<b class="' + cls(s.net) + '">' + fmt(s.net, true) + '</b>'; }],
      ['Wins', function (s) { return s.wins; }],
      ['· off discard', function (s) { return s.discardWins; }],
      ['· zi mo', function (s) { return s.zimo; }],
      ['Gang', function (s) { return s.gang; }],
      ['An Gang', function (s) { return s.angang; }],
      ['Threw a winning tile', function (s) { return s.thrown; }],
      ['Bao (paid)', function (s) { return s.bao; }],
      ['Zha Hu', function (s) { return s.zhahu; }],
      ['Biggest gain', function (s) { return s.biggestWin ? fmt(s.biggestWin) : '–'; }],
    ];
    rows.forEach(function (r) {
      h += '<tr><td>' + r[0] + '</td>';
      st.forEach(function (s) { h += '<td>' + r[1](s) + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';

    var pays = MJ.settle(tot);
    h += '<h2>Settle up</h2><div class="card">';
    if (!pays.length) h += '<p class="muted" style="margin:0">Everyone is square.</p>';
    else {
      h += '<ul class="settle">';
      pays.forEach(function (p) {
        h += '<li><span><b>' + esc(n.players[p.from]) + '</b> pays <b>' + esc(n.players[p.to]) + '</b></span><b>' + fmt(p.cents) + '</b></li>';
      });
      h += '</ul>';
    }
    h += '</div><button type="button" class="btn block" style="margin-top:10px" data-act="copy">Copy summary</button>';

    h += '<h2>Tonight\'s settings</h2><div class="card stack">';
    h += '<div class="names">';
    n.players.forEach(function (p, i) {
      h += '<label class="field"><span>Player ' + (i + 1) + '</span><input type="text" maxlength="16" data-rename="' + i + '" value="' + esc(p) + '"></label>';
    });
    h += '</div>';
    h += '<p class="small muted" style="margin:0">Rate ' + esc(rateLabel(n)) + ' · Gang ' + money(n.gang) + ' · An Gang ' + money(n.angang) +
      ' · started ' + dateStr(n.startedAt) + ', ' + timeStr(n.startedAt) + '</p>';
    h += rateTableStatic(n.rates);
    h += '</div>';
    h += '<button type="button" class="btn block danger" style="margin-top:14px" data-act="end">End night</button>';
    h += '<p class="hint" style="text-align:center">Ending saves tonight to Past nights and starts a fresh setup.</p>';
    return h;
  }
  function rateTableStatic(rates) {
    var h = '<table><thead><tr><th>Tai</th><th>1st rate</th><th>2nd rate</th></tr></thead><tbody>';
    rates.forEach(function (r, i) { h += '<tr><td>' + (i + 1) + '</td><td>' + money(r[0]) + '</td><td>' + money(r[1]) + '</td></tr>'; });
    return h + '</tbody></table>';
  }

  // ---------- Setup ----------
  function newSetup() {
    var last = store.archive[0];
    var preset = (last && last.presetKey && MJ.PRESETS[last.presetKey]) ? last.presetKey : '0.3/0.6';
    var rates = MJ.PRESETS[preset].rates.map(function (r) { return r.slice(); });
    return {
      players: last ? last.players.slice() : ['', '', '', ''],
      presetKey: preset,
      rates: rates,
      gang: last ? String(last.gang) : String(rates[0][0]),
      angang: last ? String(last.angang) : String(rates[0][1]),
      error: '',
    };
  }
  function renderSetup() {
    if (!ui.setup) ui.setup = newSetup();
    var s = ui.setup;
    var h = '<header class="topbar"><div><h1>MJ Chips</h1><div class="sub">Set up tonight\'s game</div></div></header>';
    h += '<div class="card stack"><h3 style="margin-top:0">Players</h3><div class="names">';
    s.players.forEach(function (p, i) {
      h += '<label class="field"><span>Player ' + (i + 1) + '</span><input type="text" maxlength="16" data-setup-name="' + i +
        '" value="' + esc(p) + '" placeholder="Name"></label>';
    });
    h += '</div>';

    h += '<h3>Rate</h3><div class="choices c3">';
    Object.keys(MJ.PRESETS).forEach(function (k) {
      h += '<button type="button" class="chip" data-preset="' + k + '" aria-pressed="' + (s.presetKey === k) + '">' + MJ.PRESETS[k].label + '</button>';
    });
    h += '<button type="button" class="chip" data-preset="custom" aria-pressed="' + (s.presetKey === 'custom') + '">Custom</button></div>';
    h += '<table class="ratetable"><thead><tr><th>Tai</th><th>1st rate ($)</th><th>2nd rate ($)</th></tr></thead><tbody>';
    s.rates.forEach(function (r, i) {
      h += '<tr><td>' + (i + 1) + '</td>' +
        '<td><input inputmode="decimal" data-rate="' + i + ',0" value="' + esc(r[0]) + '"></td>' +
        '<td><input inputmode="decimal" data-rate="' + i + ',1" value="' + esc(r[1]) + '"></td></tr>';
    });
    h += '</tbody></table><p class="hint" style="margin:0">Editing any amount switches to Custom.</p>';

    h += '<h3>Gang amounts (each player pays)</h3><div class="row">' +
      '<label class="field"><span>Gang ($)</span><input inputmode="decimal" data-gang="gang" value="' + esc(s.gang) + '"></label>' +
      '<label class="field"><span>An Gang ($)</span><input inputmode="decimal" data-gang="angang" value="' + esc(s.angang) + '"></label></div>' +
      '<button type="button" class="btn sm" data-act="gang-default">Use 1 tai rates (' + money(s.rates[0][0]) + ' / ' + money(s.rates[0][1]) + ')</button>';
    h += '</div>';
    if (s.error) h += '<p class="error">' + esc(s.error) + '</p>';
    h += '<button type="button" class="btn primary block" style="margin-top:16px" data-act="start">Start night</button>';

    if (store.archive.length) {
      h += '<h2>Past nights</h2><ul class="hist">';
      store.archive.forEach(function (a, ai) {
        var tot = MJ.totals(settingsOf(a), a.events);
        h += '<li><div class="head"><span class="desc">' + dateStr(a.startedAt) + '</span><span class="num">' +
          esc(rateLabel(a)) + ' · ' + a.events.length + ' entries</span></div><div class="deltas">';
        a.players.forEach(function (p, i) {
          h += '<span class="' + cls(tot[i]) + '">' + esc(p.slice(0, 8)) + '<br>' + fmt(tot[i], true) + '</span>';
        });
        h += '</div><div class="actions"><button type="button" class="btn sm" data-resume="' + ai + '">Reopen</button>' +
          '<button type="button" class="btn sm danger" data-delnight="' + ai + '">Delete</button></div></li>';
      });
      h += '</ul>';
    }
    app.innerHTML = h;
  }

  function parseMoney(v) {
    var x = Number(String(v).replace(/[$\s]/g, ''));
    return isFinite(x) && x > 0 ? x : null;
  }

  function startNight() {
    var s = ui.setup;
    var names = s.players.map(function (p, i) { return p.trim() || ('Player ' + (i + 1)); });
    var lower = names.map(function (x) { return x.toLowerCase(); });
    if (new Set(lower).size !== 4) { s.error = 'Each player needs a different name.'; return render(); }
    var rates = [];
    for (var i = 0; i < s.rates.length; i++) {
      var a = parseMoney(s.rates[i][0]), b = parseMoney(s.rates[i][1]);
      if (a === null || b === null) { s.error = 'Rate for ' + (i + 1) + ' tai must be a positive amount.'; return render(); }
      rates.push([a, b]);
    }
    var g = parseMoney(s.gang), ag = parseMoney(s.angang);
    if (g === null || ag === null) { s.error = 'Gang and An Gang must be positive amounts.'; return render(); }
    store.current = { id: uid(), startedAt: Date.now(), players: names, presetKey: s.presetKey, rates: rates, gang: g, angang: ag, events: [] };
    ui.setup = null; ui.tab = 'record'; ui.form = blankForm(); ui.editingId = null;
    save(); render(); window.scrollTo(0, 0);
  }

  function summaryText(n) {
    var tot = MJ.totals(settingsOf(n), n.events);
    var lines = ['Mahjong · ' + dateStr(n.startedAt) + ' · ' + rateLabel(n), ''];
    n.players.forEach(function (p, i) { lines.push(p + ': ' + fmt(tot[i], true)); });
    var pays = MJ.settle(tot);
    if (pays.length) {
      lines.push('', 'Settle up:');
      pays.forEach(function (x) { lines.push(n.players[x.from] + ' → ' + n.players[x.to] + ': ' + fmt(x.cents)); });
    }
    return lines.join('\n');
  }

  // ---------- Events ----------
  app.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var d = b.dataset;
    var n = night();
    var f = ui.form;

    if (d.tab) { ui.tab = d.tab; render(); window.scrollTo(0, 0); return; }
    if (d.type) {
      f.type = d.type;
      if (!MJ.TYPES[f.type].needsThrower) f.thrower = null;
      if (!MJ.TYPES[f.type].needsTai) f.tai = null;
      return render();
    }
    if (d.player !== undefined) {
      f.player = Number(d.player);
      if (f.thrower === f.player) f.thrower = null;
      return render();
    }
    if (d.thrower !== undefined) { f.thrower = Number(d.thrower); return render(); }
    if (d.tai !== undefined) { f.tai = Number(d.tai); return render(); }

    if (d.edit) {
      var ev = n.events.find(function (x) { return x.id === d.edit; });
      ui.editingId = ev.id;
      ui.form = { type: ev.type, player: ev.player, thrower: ev.thrower == null ? null : ev.thrower, tai: ev.tai == null ? null : ev.tai };
      ui.tab = 'record'; render(); window.scrollTo(0, 0); return;
    }
    if (d.del) {
      var i = n.events.findIndex(function (x) { return x.id === d.del; });
      if (i < 0) return;
      var removed = n.events.splice(i, 1)[0];
      if (ui.editingId === removed.id) { ui.editingId = null; ui.form = blankForm(); }
      save(); render();
      toast('Entry #' + (i + 1) + ' deleted', 'Undo', function () { n.events.splice(i, 0, removed); save(); render(); });
      return;
    }
    if (d.preset) {
      var s = ui.setup;
      s.presetKey = d.preset;
      if (d.preset !== 'custom') {
        s.rates = MJ.PRESETS[d.preset].rates.map(function (r) { return r.slice(); });
        s.gang = String(s.rates[0][0]); s.angang = String(s.rates[0][1]);
      }
      return render();
    }
    if (d.resume !== undefined) {
      var idx = Number(d.resume);
      if (!confirm('Reopen this night to keep playing or fix entries?')) return;
      store.current = store.archive.splice(idx, 1)[0];
      ui.setup = null; ui.tab = 'record'; save(); render(); return;
    }
    if (d.delnight !== undefined) {
      if (!confirm('Delete this past night permanently?')) return;
      store.archive.splice(Number(d.delnight), 1); save(); render(); return;
    }

    switch (d.act) {
      case 'submit': {
        var deltas;
        try { deltas = MJ.computeDeltas(settingsOf(n), f); } catch (err) { return; }
        var t = MJ.TYPES[f.type];
        var rec = { type: f.type, player: f.player, thrower: t.needsThrower ? f.thrower : null, tai: t.needsTai ? f.tai : null };
        if (ui.editingId) {
          var ex = n.events.find(function (x) { return x.id === ui.editingId; });
          Object.assign(ex, rec);
          ui.editingId = null; ui.form = blankForm(); save(); ui.tab = 'history'; render();
          toast('Entry updated');
        } else {
          rec.id = uid(); rec.at = Date.now();
          n.events.push(rec);
          ui.form = blankForm(); save(); render();
          var w = deltas[rec.player];
          toast(esc(n.players[rec.player]) + ' ' + fmt(w, true), 'Undo', function () {
            var k = n.events.indexOf(rec); if (k >= 0) n.events.splice(k, 1); save(); render();
          });
        }
        window.scrollTo(0, 0);
        return;
      }
      case 'cancel-edit': ui.editingId = null; ui.form = blankForm(); render(); return;
      case 'start': startNight(); return;
      case 'gang-default':
        ui.setup.gang = String(ui.setup.rates[0][0]); ui.setup.angang = String(ui.setup.rates[0][1]); render(); return;
      case 'end':
        if (!confirm('End tonight? It will be saved under Past nights.')) return;
        store.archive.unshift(n); store.current = null; ui.setup = null; save(); render(); window.scrollTo(0, 0); return;
      case 'copy': {
        var text = summaryText(n);
        var done = function () { toast('Summary copied'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { prompt('Copy this:', text); });
        else prompt('Copy this:', text);
        return;
      }
    }
  });

  app.addEventListener('input', function (e) {
    var el = e.target, d = el.dataset, s = ui.setup;
    if (d.setupName !== undefined) { s.players[Number(d.setupName)] = el.value; return; }
    if (d.rate) {
      var p = d.rate.split(',').map(Number);
      s.rates[p[0]][p[1]] = el.value;
      if (s.presetKey !== 'custom') {
        s.presetKey = 'custom';
        var chips = app.querySelectorAll('[data-preset]');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.preset === 'custom')); });
      }
      return;
    }
    if (d.gang) { s[d.gang] = el.value; return; }
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset.rename !== undefined) {
      var n = night(), i = Number(el.dataset.rename), v = el.value.trim();
      var clash = n.players.some(function (p, j) { return j !== i && p.toLowerCase() === v.toLowerCase(); });
      if (v && !clash) { n.players[i] = v; save(); }
      else toast(v ? 'That name is already taken' : 'Name can\'t be empty');
      render();
    }
  });

  render();
})();

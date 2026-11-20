/* MJ Chips — UI. Depends on calc.js (window.MJ). */
(function () {
  'use strict';

  var STORE_KEY = 'mj-chips-v1';
  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');

  // ---------- Icons (24px, stroke-based) ----------
  var ICONS = {
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5V8a4 4 0 0 1-4 4M7 6H4.5A1.5 1.5 0 0 0 3 7.5V8a4 4 0 0 0 4 4"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
    tiles: '<rect x="2" y="6" width="4.5" height="12" rx="1"/><rect x="7.2" y="6" width="4.5" height="12" rx="1"/><rect x="12.4" y="6" width="4.5" height="12" rx="1"/><rect x="17.6" y="6" width="4.5" height="12" rx="1"/>',
    tilesHidden: '<rect x="2" y="6" width="4.5" height="12" rx="1"/><rect x="7.2" y="6" width="4.5" height="12" rx="1" fill="currentColor"/><rect x="12.4" y="6" width="4.5" height="12" rx="1" fill="currentColor"/><rect x="17.6" y="6" width="4.5" height="12" rx="1"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/>',
    shieldUp: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M9 12.5l3-3 3 3M9 16l3-3 3 3"/>',
    alert: '<path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    coins: '<circle cx="9" cy="9" r="6"/><path d="M15.4 9.6a6 6 0 1 1-5.8 5.8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    reopen: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  var LOGO = '<svg class="logo" viewBox="0 0 38 46" aria-hidden="true">' +
    '<rect x="1" y="4" width="36" height="41" rx="8" fill="#cbbd9a"/>' +
    '<rect x="1" y="1" width="36" height="40" rx="8" fill="#fffaf0"/>' +
    '<text x="19" y="29.5" text-anchor="middle" font-size="22" font-weight="800" fill="#c8372d" ' +
    'font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC, sans-serif">中</text></svg>';

  var DICE_BTN = '<button type="button" class="dice-btn" data-act="dice" aria-label="Roll dice">' +
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/>' +
    '<circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>' +
    '<circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/></svg><span>Dice</span></button>';

  var TYPE_ICON = { discard: 'trophy', zimo: 'sparkle', gang: 'tiles', angang: 'tilesHidden', bao: 'shield', baolimit: 'shieldUp', zhahu: 'alert' };
  var TYPE_ALT = { bao: true, baolimit: true, zhahu: true };
  var TYPE_CN = { zimo: true, gang: true, angang: true, bao: true, baolimit: true, zhahu: true };

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
  var ui = { tab: 'record', form: blankForm(), editingId: null, setup: null };
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
  function tint(c) { return c > 0 ? 'up' : c < 0 ? 'down' : ''; }
  function money(x) { return fmt(MJ.toCents(x)); }
  function night() { return store.current; }
  function settingsOf(n) { return { rates: n.rates, gang: n.gang, angang: n.angang }; }
  function rateLabel(n) {
    return n.presetKey && MJ.PRESETS[n.presetKey] ? MJ.PRESETS[n.presetKey].label : 'Custom';
  }
  function dateStr(ts) {
    return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function timeStr(ts) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  function initial(name) { var ch = Array.from(String(name).trim())[0]; return ch ? ch.toUpperCase() : '?'; }
  function avatar(n, i, size) {
    return '<span class="av c' + i + (size ? ' ' + size : '') + '">' + esc(initial(n.players ? n.players[i] : n[i])) + '</span>';
  }

  // Shooter flag for the hand being recorded: an edited hand keeps its own flag.
  function shooterOn(n) {
    if (ui.editingId) {
      var ev = n.events.find(function (x) { return x.id === ui.editingId; });
      if (ev) return !!ev.shooter;
    }
    return !!n.shooter;
  }
  function formEvent(n) {
    var f = ui.form, t = MJ.TYPES[f.type];
    var rec = { type: f.type, player: f.player, thrower: t.needsThrower ? f.thrower : null, tai: t.needsTai ? f.tai : null };
    if (shooterOn(n)) rec.shooter = true; // only discard wins are affected
    return rec;
  }

  function describe(n, ev) {
    var P = function (i) { return '<b>' + esc(n.players[i]) + '</b>'; };
    switch (ev.type) {
      case 'discard': return P(ev.player) + ' won off ' + P(ev.thrower) + (ev.shooter ? ' · shooter' : '');
      case 'zimo': return P(ev.player) + ' 自摸';
      case 'gang': return P(ev.player) + ' 杠';
      case 'angang': return P(ev.player) + ' 暗杠';
      case 'bao': return P(ev.player) + ' won · 包 by ' + P(ev.thrower);
      case 'baolimit': return P(ev.player) + ' won · 包 Limit by ' + P(ev.thrower);
      case 'zhahu': return P(ev.player) + ' 诈胡';
    }
    return '';
  }

  var toastTimer = null;
  function toast(msg, actionLabel, action) {
    clearTimeout(toastTimer);
    toastEl.innerHTML = '<span>' + msg + '</span>' +
      (actionLabel ? '<button type="button">' + icon('undo', 'sm') + esc(actionLabel) + '</button>' : '');
    toastEl.hidden = false;
    if (actionLabel) toastEl.querySelector('button').onclick = function () { toastEl.hidden = true; action(); };
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 5000);
  }

  // ---------- Render: main ----------
  function render() {
    if (!night()) return renderSetup();
    app.classList.remove('no-tabs');
    var n = night();
    var tot = MJ.totals(settingsOf(n), n.events);
    var max = Math.max.apply(null, tot);
    var h = '<header class="hero"><div class="brand">' + LOGO +
      '<div><h1>MJ Chips</h1><div class="sub">' + dateStr(n.startedAt) + '</div></div>' + DICE_BTN + '</div>';
    h += '<div class="pills"><span class="pill">' + icon('coins') + esc(rateLabel(n)) + '</span>' +
      '<span class="pill">' + icon('tiles') + '杠 ' + money(n.gang) + '</span>' +
      '<span class="pill">' + icon('tilesHidden') + '暗杠 ' + money(n.angang) + '</span>' +
      (n.shooter ? '<span class="pill shooter">' + icon('target') + 'Shooter</span>' : '') + '</div>';
    h += '<section class="scores" aria-label="Scores">';
    n.players.forEach(function (p, i) {
      var lead = max > 0 && tot[i] === max;
      h += '<div class="score">' + (lead ? '<span class="crown" title="Leading">' + icon('crown') + '</span>' : '') +
        '<div class="who">' + avatar(n, i) + '<span class="name">' + esc(p) + '</span></div>' +
        '<div class="amt ' + (tot[i] ? cls(tot[i]) : 'zero') + '">' + fmt(tot[i], true) + '</div></div>';
    });
    h += '</section></header>';

    if (ui.tab === 'record') h += renderRecord(n);
    else if (ui.tab === 'history') h += renderHistory(n);
    else h += renderSummary(n, tot);

    h += '<nav class="tabs" aria-label="Sections"><div class="inner">' +
      tabBtn('record', 'plus', ui.editingId ? 'Edit' : 'Record') +
      tabBtn('history', 'history', 'History', n.events.length) +
      tabBtn('summary', 'chart', 'Summary') + '</div></nav>';
    app.innerHTML = h;
  }
  function tabBtn(id, ico, label, count) {
    return '<button type="button" data-tab="' + id + '"' + (ui.tab === id ? ' aria-current="page"' : '') + '>' +
      '<span class="pip">' + icon(ico) + '</span><span>' + label +
      (count ? '<span class="count">' + count + '</span>' : '') + '</span></button>';
  }

  function step(num, label, done, opt) {
    return '<div class="step"><span class="n' + (done ? ' done' : '') + '">' + (done ? icon('check', 'sm') : num) + '</span>' +
      label + (opt ? ' <span class="opt">' + opt + '</span>' : '') + '</div>';
  }

  function renderRecord(n) {
    var f = ui.form;
    var t = MJ.TYPES[f.type];
    var h = '';
    if (ui.editingId) {
      var num = n.events.findIndex(function (e) { return e.id === ui.editingId; }) + 1;
      h += '<div class="banner"><span>' + icon('pencil', 'sm') + 'Editing hand #' + num + '</span>' +
        '<button type="button" class="btn sm" data-act="cancel-edit">' + icon('x', 'sm') + 'Cancel</button></div>';
    }
    var s = 1;
    h += step(s++, 'What happened?', true);
    h += '<div class="choices c4">';
    ['discard', 'zimo', 'gang', 'angang'].forEach(function (k) { h += typeChip(k); });
    h += '</div><div class="choices c3" style="margin-top:8px">';
    ['bao', 'baolimit', 'zhahu'].forEach(function (k) { h += typeChip(k); });
    h += '</div>';

    var playerLabel = { discard: 'Who won?', zimo: 'Who won?', bao: 'Who won?', baolimit: 'Who won?',
      gang: 'Who made the 杠?', angang: 'Who made the 暗杠?', zhahu: 'Who 诈胡?' }[f.type];
    h += step(s++, playerLabel, f.player !== null, f.type === 'zhahu' ? 'pays everyone' : '');
    h += '<div class="choices c4">';
    n.players.forEach(function (p, i) {
      h += '<button type="button" class="chip person" data-player="' + i + '" aria-pressed="' + (f.player === i) + '">' +
        avatar(n, i, 'lg') + '<span class="lbl">' + esc(p) + '</span></button>';
    });
    h += '</div>';

    if (t.needsThrower) {
      h += step(s++, 'Who threw the tile?', f.thrower !== null, f.type === 'discard' ? '' : 'pays for everyone');
      h += '<div class="choices c4">';
      n.players.forEach(function (p, i) {
        h += '<button type="button" class="chip person" data-thrower="' + i + '" aria-pressed="' + (f.thrower === i) + '"' +
          (f.player === i ? ' disabled' : '') + '>' + avatar(n, i, 'lg') + '<span class="lbl">' + esc(p) + '</span></button>';
      });
      h += '</div>';
    }

    if (t.needsTai) {
      h += step(s++, 'How many 台?', f.tai !== null);
      h += '<div class="choices c5">';
      for (var k = 1; k <= MJ.MAX_TAI; k++) {
        var r = n.rates[k - 1];
        h += '<button type="button" class="chip tai" data-tai="' + k + '" aria-pressed="' + (f.tai === k) + '">' +
          '<span class="big">' + k + '</span><small>' + money(r[0]) + '/' + money(r[1]) + '</small></button>';
      }
      h += '</div>';
    }

    var hint = {
      discard: shooterOn(n)
        ? 'Shooter: thrower pays for everyone, 2nd rate + 2 × 1st rate.'
        : 'Thrower pays the 2nd rate, the other two pay the 1st rate.',
      zimo: 'All three pay the 2nd rate.',
      gang: 'All three pay ' + money(n.gang) + '.',
      angang: 'All three pay ' + money(n.angang) + '.',
      bao: 'Thrower pays everything at 5 台: 2 × ' + money(n.rates[4][0]) + ' + ' + money(n.rates[4][1]) + '.',
      baolimit: 'Thrower pays everything at 5 台: 3 × ' + money(n.rates[4][1]) + '.',
      zhahu: 'Pays each other player ' + money(n.rates[4][1]) + ' (5 台, 2nd rate).',
    }[f.type];
    h += '<p class="hint">' + icon('info') + '<span>' + hint + '</span></p>';

    var deltas = null, err = null;
    try { deltas = MJ.computeDeltas(settingsOf(n), formEvent(n)); } catch (e) { err = e.message; }
    h += '<div class="submitbar"><div class="preview">';
    n.players.forEach(function (p, i) {
      var v = deltas ? deltas[i] : 0;
      h += '<div class="' + (deltas ? tint(v) : '') + '"><div class="n">' + avatar(n, i, 'sm') + '<span>' + esc(p) + '</span></div>' +
        '<div class="v ' + (deltas ? cls(v) : 'muted') + '">' + (deltas ? (v ? fmt(v, true) : '–') : '–') + '</div></div>';
    });
    h += '</div>';
    h += '<button type="button" class="btn primary block" data-act="submit"' + (deltas ? '' : ' disabled') + '>' +
      icon(ui.editingId ? 'check' : 'plus') + (ui.editingId ? 'Save changes' : 'Add hand') + '</button>';
    if (!deltas && err && f.player !== null) h += '<p class="why">' + esc(err) + '</p>';
    h += '</div>';
    return h;
  }
  function typeChip(k) {
    return '<button type="button" class="chip type' + (TYPE_ALT[k] ? ' alt' : '') + (TYPE_CN[k] ? ' cn' : '') +
      '" data-type="' + k + '" aria-pressed="' + (ui.form.type === k) + '">' + icon(TYPE_ICON[k]) +
      '<span class="lbl">' + MJ.TYPES[k].short + '</span></button>';
  }

  // ---------- Render: history ----------
  function renderHistory(n) {
    if (!n.events.length) {
      return '<div class="empty">' + icon('tiles') + '<div>No hands yet.<br>Record the first one on the Record tab.</div></div>';
    }
    var s = settingsOf(n);
    var h = '<h2>' + icon('history') + 'History</h2><ul class="hist">';
    for (var idx = n.events.length - 1; idx >= 0; idx--) {
      var ev = n.events[idx];
      var d = MJ.computeDeltas(s, ev);
      var meta = '#' + (idx + 1) + ' · ' + timeStr(ev.at) + (ev.tai ? ' · ' + ev.tai + ' 台' : '');
      h += '<li' + (ev.id === ui.editingId ? ' class="editing"' : '') + '><div class="head">' +
        '<span class="badge' + (TYPE_ALT[ev.type] ? ' alt' : '') + '">' + icon(TYPE_ICON[ev.type]) + '</span>' +
        '<div class="desc">' + describe(n, ev) + '<div class="meta">' + meta + '</div></div>' +
        '<div class="actions"><button type="button" class="btn icon" aria-label="Edit hand ' + (idx + 1) + '" data-edit="' + ev.id + '">' + icon('pencil', 'sm') + '</button>' +
        '<button type="button" class="btn icon danger" aria-label="Delete hand ' + (idx + 1) + '" data-del="' + ev.id + '">' + icon('trash', 'sm') + '</button></div></div>';
      h += '<div class="deltas">';
      n.players.forEach(function (p, i) {
        h += '<span class="' + tint(d[i]) + ' ' + cls(d[i]) + '" title="' + esc(p) + '">' + avatar(n, i, 'sm') + (d[i] ? fmt(d[i], true) : '–') + '</span>';
      });
      h += '</div></li>';
    }
    return h + '</ul>';
  }

  // ---------- Render: summary ----------
  function renderSummary(n, tot) {
    var st = MJ.stats(settingsOf(n), n.events);
    var h = '<h2>' + icon('chart') + 'Tonight</h2><div class="card scroll-x"><table><thead><tr><th></th>';
    n.players.forEach(function (p, i) { h += '<th>' + avatar(n, i) + esc(p) + '</th>'; });
    h += '</tr></thead><tbody>';
    var rows = [
      ['Net', function (s) { return '<b class="' + cls(s.net) + '">' + fmt(s.net, true) + '</b>'; }, 'net'],
      ['Wins', function (s) { return s.wins; }],
      ['off discard', function (s) { return s.discardWins; }, 'sub'],
      ['自摸', function (s) { return s.zimo; }, 'sub'],
      ['杠', function (s) { return s.gang; }],
      ['暗杠', function (s) { return s.angang; }],
      ['Threw winning tile', function (s) { return s.thrown; }],
      ['包 (paid)', function (s) { return s.bao; }],
      ['诈胡', function (s) { return s.zhahu; }],
      ['Biggest gain', function (s) { return s.biggestWin ? fmt(s.biggestWin) : '–'; }],
    ];
    rows.forEach(function (r) {
      h += '<tr' + (r[2] === 'net' ? ' class="net"' : '') + '><td class="lbl' + (r[2] === 'sub' ? ' sub' : '') + '">' + r[0] + '</td>';
      st.forEach(function (s) { var v = r[1](s); h += '<td>' + (v === 0 ? '<span class="muted">0</span>' : v) + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';

    var pays = MJ.settle(tot);
    h += '<h2>' + icon('coins') + 'Settle up</h2><div class="card">';
    if (!pays.length) h += '<p class="muted" style="margin:0">Everyone is square.</p>';
    else {
      h += '<ul class="settle">';
      pays.forEach(function (p) {
        h += '<li><span class="who">' + avatar(n, p.from) + '<span class="nm">' + esc(n.players[p.from]) + '</span>' + icon('arrow', 'sm') +
          avatar(n, p.to) + '<span class="nm">' + esc(n.players[p.to]) + '</span></span><span class="amt">' + fmt(p.cents) + '</span></li>';
      });
      h += '</ul>';
    }
    h += '</div><button type="button" class="btn block" style="margin-top:10px" data-act="copy">' + icon('copy') + 'Copy summary</button>';

    h += '<h2>' + icon('users') + 'Players &amp; rates</h2><div class="card stack"><div class="names">';
    n.players.forEach(function (p, i) {
      h += '<label class="field"><span>' + avatar(n, i, 'sm') + 'Player ' + (i + 1) + '</span><input type="text" maxlength="16" data-rename="' + i + '" value="' + esc(p) + '"></label>';
    });
    h += '</div>';
    h += '<p class="small muted" style="margin:0">' + esc(rateLabel(n)) + ' · 杠 ' + money(n.gang) + ' · 暗杠 ' + money(n.angang) + (n.shooter ? ' · Shooter' : '') +
      ' · started ' + timeStr(n.startedAt) + '</p>';
    h += rateTableStatic(n.rates) + '</div>';
    h += shooterCard(!!n.shooter, 'night-shooter', 'Changing this only affects hands recorded afterwards.');
    h += '<button type="button" class="btn block danger" style="margin-top:16px" data-act="end">' + icon('flag') + 'End night</button>';
    h += '<p class="hint" style="justify-content:center">Saves tonight to Past nights and starts a fresh setup.</p>';
    return h;
  }
  function shooterCard(on, act, note) {
    return '<div class="card toggle-card"><div class="toggle-text"><div class="section-title" style="margin:0 0 4px">' + icon('target') + 'Shooter mode</div>' +
      '<div class="small muted">On a discard win the thrower pays for everyone (2nd rate + both 1st-rate shares).' +
      (note ? ' ' + note : '') + '</div></div>' +
      '<button type="button" class="switch" role="switch" aria-checked="' + on + '" aria-label="Shooter mode" data-act="' + act + '"><span></span></button></div>';
  }

  function rateTableStatic(rates) {
    var h = '<table><thead><tr><th>台</th><th>1st rate</th><th>2nd rate</th></tr></thead><tbody>';
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
      shooter: last ? !!last.shooter : false,
      error: '',
    };
  }
  function renderSetup() {
    app.classList.add('no-tabs');
    if (!ui.setup) ui.setup = newSetup();
    var s = ui.setup;
    var h = '<header class="hero"><div class="brand">' + LOGO +
      '<div><h1>MJ Chips</h1><div class="sub">Set up tonight\'s game</div></div>' + DICE_BTN + '</div></header>';

    h += '<div class="card" style="margin-top:16px"><div class="section-title">' + icon('users') + 'Players</div><div class="names">';
    s.players.forEach(function (p, i) {
      h += '<label class="field"><span><span class="av sm c' + i + '">' + (i + 1) + '</span>Player ' + (i + 1) + '</span>' +
        '<input type="text" maxlength="16" data-setup-name="' + i + '" value="' + esc(p) + '" placeholder="Name"></label>';
    });
    h += '</div></div>';

    h += '<div class="card"><div class="section-title">' + icon('coins') + 'Rate</div><div class="choices c3">';
    Object.keys(MJ.PRESETS).forEach(function (k) {
      var r = MJ.PRESETS[k].rates[0];
      h += '<button type="button" class="chip" data-preset="' + k + '" aria-pressed="' + (s.presetKey === k) + '">' +
        '<span class="lbl">' + MJ.PRESETS[k].label + '</span><small>1 台 ' + money(r[0]) + '/' + money(r[1]) + '</small></button>';
    });
    h += '<button type="button" class="chip" data-preset="custom" aria-pressed="' + (s.presetKey === 'custom') + '">' +
      '<span class="lbl">Custom</span><small>your own</small></button></div>';
    h += '<table class="ratetable" style="margin-top:12px"><thead><tr><th>台</th><th>1st rate ($)</th><th>2nd rate ($)</th></tr></thead><tbody>';
    s.rates.forEach(function (r, i) {
      h += '<tr><td>' + (i + 1) + '</td>' +
        '<td><input inputmode="decimal" aria-label="' + (i + 1) + ' 台 1st rate" data-rate="' + i + ',0" value="' + esc(r[0]) + '"></td>' +
        '<td><input inputmode="decimal" aria-label="' + (i + 1) + ' 台 2nd rate" data-rate="' + i + ',1" value="' + esc(r[1]) + '"></td></tr>';
    });
    h += '</tbody></table><p class="hint">' + icon('info') + '<span>Editing any amount switches to Custom.</span></p></div>';

    h += '<div class="card"><div class="section-title">' + icon('tiles') + '杠 amounts · each player pays</div><div class="row">' +
      '<label class="field"><span>杠 ($)</span><input inputmode="decimal" data-gang="gang" value="' + esc(s.gang) + '"></label>' +
      '<label class="field"><span>暗杠 ($)</span><input inputmode="decimal" data-gang="angang" value="' + esc(s.angang) + '"></label></div>' +
      '<button type="button" class="btn sm" style="margin-top:12px" data-act="gang-default">' + icon('reopen', 'sm') +
      'Use 1 台 rates (' + money(s.rates[0][0]) + ' / ' + money(s.rates[0][1]) + ')</button></div>';
    h += shooterCard(s.shooter, 'setup-shooter');
    if (s.error) h += '<p class="error">' + icon('alert', 'sm') + esc(s.error) + '</p>';
    h += '<button type="button" class="btn primary block" style="margin-top:16px" data-act="start">' + icon('play') + 'Start night</button>';

    if (store.archive.length) {
      h += '<h2>' + icon('calendar') + 'Past nights</h2><ul class="hist">';
      store.archive.forEach(function (a, ai) {
        var tot = MJ.totals(settingsOf(a), a.events);
        h += '<li><div class="head"><span class="badge">' + icon('calendar') + '</span><div class="desc">' + dateStr(a.startedAt) +
          '<div class="meta">' + esc(rateLabel(a)) + ' · ' + a.events.length + ' hands</div></div>' +
          '<div class="actions"><button type="button" class="btn icon" aria-label="Reopen night" data-resume="' + ai + '">' + icon('reopen', 'sm') + '</button>' +
          '<button type="button" class="btn icon danger" aria-label="Delete night" data-delnight="' + ai + '">' + icon('trash', 'sm') + '</button></div></div><div class="deltas">';
        a.players.forEach(function (p, i) {
          h += '<span class="' + tint(tot[i]) + ' ' + cls(tot[i]) + '" title="' + esc(p) + '">' + avatar(a, i, 'sm') + fmt(tot[i], true) + '</span>';
        });
        h += '</div></li>';
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
      if (a === null || b === null) { s.error = 'Rate for ' + (i + 1) + ' 台 must be a positive amount.'; return render(); }
      rates.push([a, b]);
    }
    var g = parseMoney(s.gang), ag = parseMoney(s.angang);
    if (g === null || ag === null) { s.error = '杠 and 暗杠 must be positive amounts.'; return render(); }
    store.current = { id: uid(), startedAt: Date.now(), players: names, presetKey: s.presetKey, rates: rates, gang: g, angang: ag, shooter: !!s.shooter, events: [] };
    ui.setup = null; ui.tab = 'record'; ui.form = blankForm(); ui.editingId = null;
    save(); render(); window.scrollTo(0, 0);
  }

  function summaryText(n) {
    var tot = MJ.totals(settingsOf(n), n.events);
    var lines = ['🀄 Mahjong · ' + dateStr(n.startedAt) + ' · ' + rateLabel(n) + (n.shooter ? ' · Shooter' : ''), ''];
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
      toast('Hand #' + (i + 1) + ' deleted', 'Undo', function () { n.events.splice(i, 0, removed); save(); render(); });
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
      if (!confirm('Reopen this night to keep playing or fix hands?')) return;
      store.current = store.archive.splice(Number(d.resume), 1)[0];
      ui.setup = null; ui.tab = 'record'; save(); render(); return;
    }
    if (d.delnight !== undefined) {
      if (!confirm('Delete this past night permanently?')) return;
      store.archive.splice(Number(d.delnight), 1); save(); render(); return;
    }

    switch (d.act) {
      case 'submit': {
        var deltas;
        var rec = formEvent(n);
        try { deltas = MJ.computeDeltas(settingsOf(n), rec); } catch (err) { return; }
        if (ui.editingId) {
          var ex = n.events.find(function (x) { return x.id === ui.editingId; });
          delete ex.shooter;
          Object.assign(ex, rec);
          ui.editingId = null; ui.form = blankForm(); save(); ui.tab = 'history'; render();
          toast('Hand updated');
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
      case 'dice': Dice.open(); return;
      case 'setup-shooter': ui.setup.shooter = !ui.setup.shooter; render(); return;
      case 'night-shooter':
        n.shooter = !n.shooter; save(); render();
        toast('Shooter mode ' + (n.shooter ? 'on' : 'off') + ' for new hands');
        return;
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
        app.querySelectorAll('[data-preset]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.preset === 'custom')); });
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

  // ---------- Dice ----------
  var Dice = (function () {
    // Pip positions on a 3x3 grid (0-8, row by row).
    var PIPS = { 1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
    var el = null, values = [1, 1, 1], rolling = false, rolled = false;

    // Fair 1-6 using crypto with rejection sampling (no modulo bias).
    function d6() {
      var c = window.crypto || window.msCrypto;
      if (c && c.getRandomValues) {
        var buf = new Uint8Array(1);
        do { c.getRandomValues(buf); } while (buf[0] >= 252);
        return (buf[0] % 6) + 1;
      }
      return Math.floor(Math.random() * 6) + 1;
    }
    function face(v) {
      var h = '<div class="die' + (v === 1 || v === 4 ? ' red' : '') + '" aria-label="' + v + '">';
      for (var i = 0; i < 9; i++) h += '<span class="' + (PIPS[v].indexOf(i) >= 0 ? 'pip' : '') + '"></span>';
      return h + '</div>';
    }
    function paint() {
      el.querySelector('.dice-row').innerHTML = values.map(face).join('');
      var total = values[0] + values[1] + values[2];
      el.querySelector('.dice-total').innerHTML = rolled
        ? '<span class="lbl">Total</span><span class="num">' + total + '</span>'
        : '<span class="lbl">Tap Roll to throw the dice</span>';
      el.querySelector('.dice-row').classList.toggle('shaking', rolling);
      el.querySelector('[data-dice=roll]').disabled = rolling;
    }
    function roll() {
      if (rolling) return;
      rolling = true; rolled = false;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var ticks = reduce ? 0 : 9, n = 0;
      var final = [d6(), d6(), d6()];
      (function tick() {
        if (n++ < ticks) {
          values = [d6(), d6(), d6()]; paint();
          setTimeout(tick, 45 + n * 12);
        } else {
          values = final; rolling = false; rolled = true; paint();
          if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* ignore */ } }
        }
      })();
    }
    function close() { if (el) el.hidden = true; }
    function open() {
      if (!el) {
        el = document.createElement('div');
        el.className = 'sheet-wrap';
        el.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="Dice">' +
          '<div class="sheet-head"><h2>' + DICE_BTN.match(/<svg[\s\S]*?<\/svg>/)[0] + 'Dice</h2>' +
          '<button type="button" class="btn icon" data-dice="close" aria-label="Close">' + icon('x', 'sm') + '</button></div>' +
          '<div class="dice-row" data-dice="roll-area"></div><div class="dice-total" aria-live="polite"></div>' +
          '<button type="button" class="btn primary block" data-dice="roll">' + icon('reopen') + 'Roll</button></div>';
        document.body.appendChild(el);
        el.addEventListener('click', function (e) {
          if (e.target === el) return close();
          var b = e.target.closest('[data-dice]');
          if (!b) return;
          if (b.dataset.dice === 'close') close();
          else roll();
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !el.hidden) close(); });
      }
      el.hidden = false;
      rolled = false; values = [1, 1, 1]; paint();
      el.querySelector('[data-dice=roll]').focus();
    }
    return { open: open, d6: d6 };
  })();

  render();
})();

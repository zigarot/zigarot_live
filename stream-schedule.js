/*
 * Renders the stream schedule in the VIEWER's timezone, plus a live countdown
 * to the next stream.
 *
 * The wrinkle this solves: "Thursday 5PM Brisbane" is not "Thursday 5PM"
 * anywhere else. In New York it is Wednesday evening. So the schedule cannot
 * be a static list of weekday names — each slot has to be resolved to a real
 * instant first, then formatted in local time, letting the weekday fall where
 * it falls.
 */
(function () {
  /* The countdown sits inside the player's offline card; the full list sits in
     its own section below. Different parents, so query the document rather
     than a single root, and reveal by attribute. */
  var cfgEl = document.getElementById('stream-schedule-config');
  if (!cfgEl) return;

  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var TZ = cfg.timeZone;
  var SLOTS = cfg.slots || [];
  if (!TZ || !SLOTS.length) return;

  /* Each role appears twice — once in the offline card (desktop) and once in
     the section below the player (stacked). CSS decides which is visible;
     render into all of them. */
  function each(nodes, fn) { Array.prototype.forEach.call(nodes, fn); }
  var elNext = document.querySelectorAll('[data-role="countdown"]');
  var elList = document.querySelectorAll('[data-role="list"]');
  var elTz   = document.querySelectorAll('[data-role="tz"]');
  if (!elNext.length && !elList.length) return;
  var DAY_MS = 86400000;
  var WEEK_MS = 7 * DAY_MS;
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // What the wall clock in `tz` reads at `date`.
  function zoneParts(date, tz) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, weekday: 'short',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var p = {};
    dtf.formatToParts(date).forEach(function (x) {
      if (x.type !== 'literal') p[x.type] = x.value;
    });
    return {
      year: +p.year, month: +p.month, day: +p.day,
      hour: p.hour === '24' ? 0 : +p.hour,
      minute: +p.minute, second: +p.second,
      weekday: WEEKDAYS.indexOf(p.weekday)
    };
  }

  // Offset of `tz` at `date`, in ms. Asking Intl rather than hardcoding +10
  // means a zone with DST stays correct across the changeover.
  function offsetMs(date, tz) {
    var p = zoneParts(date, tz);
    var asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return asUTC - Math.floor(date.getTime() / 1000) * 1000;
  }

  // The next instant at which the clock in TZ reads this slot's weekday+time.
  function nextFor(slot, fromMs) {
    for (var i = 0; i < 9; i++) {
      var p = zoneParts(new Date(fromMs + i * DAY_MS), TZ);
      if (p.weekday !== slot.day) continue;
      var guess = Date.UTC(p.year, p.month - 1, p.day, slot.hour, slot.minute);
      var inst = guess - offsetMs(new Date(guess), TZ);
      if (inst > fromMs) return inst;
    }
    return null;
  }

  function fmtDay(ms) {
    return new Date(ms).toLocaleString(undefined, { weekday: 'short' });
  }
  function fmtTime(ms) {
    return new Date(ms).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  /* Collapse slots that land on the same LOCAL time into one row:
     "Thu / Fri / Sat — 5:00 pm". Grouping has to happen after conversion, not
     on the Brisbane config, because a viewer's offset can split one Brisbane
     time across two local times (and merge two into one). `times` arrives
     soonest-first, so both the groups and the days inside them stay in
     next-up order. */
  function grouped(times) {
    var order = [], map = {};
    times.forEach(function (t) {
      var k = fmtTime(t), d = fmtDay(t);
      if (!map[k]) { map[k] = { time: k, days: [] }; order.push(k); }
      if (map[k].days.indexOf(d) === -1) map[k].days.push(d);
    });
    return order.map(function (k) { return map[k]; });
  }

  function countdown(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600);  s -= h * 3600;
    var m = Math.floor(s / 60);    s -= m * 60;
    if (d) return d + 'd ' + h + 'h ' + m + 'm';
    if (h) return h + 'h ' + m + 'm';
    if (m) return m + 'm ' + s + 's';
    return s + 's';
  }

  // Each slot's next occurrence, soonest first. Recomputed rather than cached
  // so the list rolls over correctly once a stream time passes.
  function upcoming() {
    var now = Date.now();
    return SLOTS
      .map(function (s) { return nextFor(s, now); })
      .filter(function (v) { return v !== null; })
      .sort(function (a, b) { return a - b; });
  }

  var lastList = '';

  function render() {
    var times = upcoming();
    if (!times.length) return;

    var next = 'Next stream in ' + countdown(times[0] - Date.now());
    each(elNext, function (el) { el.textContent = next; });

    // Only touch the DOM when the rendered set actually changes.
    var key = times.join(',');
    if (key !== lastList) {
      lastList = key;
      var groups = grouped(times);
      each(elList, function (ul) {
        ul.innerHTML = '';
        groups.forEach(function (g, i) {
          var li = document.createElement('li');
          li.textContent = g.days.join(' / ') + ' \u2014 ' + g.time;
          if (i === 0) li.className = 'is-next';
          ul.appendChild(li);
        });
      });
    }

    each(elTz, function (el) {
      if (el.textContent) return;
      var zone = '';
      try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      el.textContent = zone ? 'Shown in your local time (' + zone + ')' : 'Shown in your local time';
    });
  }

  var timer = null;
  function start() { stop(); render(); timer = setInterval(render, 1000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-schedule-block]'),
    function (el) { el.hidden = false; }
  );
  if (!document.hidden) start(); else render();
})();

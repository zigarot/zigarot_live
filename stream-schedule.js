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
  var root = document.getElementById('stream-schedule');
  var cfgEl = document.getElementById('stream-schedule-config');
  if (!root || !cfgEl) return;

  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var TZ = cfg.timeZone;
  var SLOTS = cfg.slots || [];
  if (!TZ || !SLOTS.length) return;

  var elNext = root.querySelector('[data-role="countdown"]');
  var elList = root.querySelector('[data-role="list"]');
  var elTz   = root.querySelector('[data-role="tz"]');
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

  function fmtLocal(ms) {
    return new Date(ms).toLocaleString(undefined, {
      weekday: 'long', hour: 'numeric', minute: '2-digit'
    });
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

    if (elNext) {
      elNext.textContent = 'Next stream in ' + countdown(times[0] - Date.now());
    }

    // Only touch the DOM when the rendered set actually changes.
    var key = times.join(',');
    if (elList && key !== lastList) {
      lastList = key;
      elList.innerHTML = '';
      times.forEach(function (t, i) {
        var li = document.createElement('li');
        li.textContent = fmtLocal(t);
        if (i === 0) li.className = 'is-next';
        elList.appendChild(li);
      });
    }

    if (elTz && !elTz.textContent) {
      var zone = '';
      try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      elTz.textContent = zone ? 'Shown in your local time (' + zone + ')' : 'Shown in your local time';
    }
  }

  var timer = null;
  function start() { stop(); render(); timer = setInterval(render, 1000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  root.hidden = false;
  if (!document.hidden) start(); else render();
})();

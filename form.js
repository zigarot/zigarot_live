(function () {
  var form = document.getElementById('req-form');
  if (!form) return;

  var status = document.getElementById('req-status');
  var BRISBANE = 'Australia/Brisbane';

  /* Conditional sections.
   * register(wrapId, predicate) - predicate returns true when visible.
   * syncAll runs on every form change, in registration order, so a parent
   * settles before the section nested inside it. */

  var conditionals = [];

  function register(wrapId, predicate) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    conditionals.push({ wrap: wrap, predicate: predicate });
  }

  function checked(id) {
    var el = document.getElementById(id);
    return function () {
      return !!el && el.checked;
    };
  }

  function valueIs(id, wanted) {
    var el = document.getElementById(id);
    return function () {
      return !!el && el.value === wanted;
    };
  }

  /* Hidden inputs still submit, so empty a section when it hides.
   * Radios reset to the option carrying the `checked` attribute. */
  function clearSection(wrap) {
    var fields = wrap.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === 'checkbox') {
        field.checked = false;
      } else if (field.type === 'radio') {
        field.checked = field.hasAttribute('checked');
      } else if (field.tagName === 'SELECT') {
        field.selectedIndex = 0;
      } else if (field.type !== 'hidden') {
        field.value = '';
      } else {
        field.value = '';
      }
    }
    var previews = wrap.querySelectorAll('.req-tz-preview');
    for (var p = 0; p < previews.length; p++) previews[p].textContent = '';
  }

  /* `required` on a hidden field blocks submit with an error the browser
   * cannot show - it cannot focus what it cannot display. Toggle with
   * visibility, do not put `required` in the markup. */
  function syncRequired(wrap, visible) {
    var fields = wrap.querySelectorAll('[data-required-when-shown]');
    for (var i = 0; i < fields.length; i++) {
      if (visible) fields[i].setAttribute('required', '');
      else fields[i].removeAttribute('required');
    }
  }

  function syncAll() {
    for (var i = 0; i < conditionals.length; i++) {
      var entry = conditionals[i];
      var visible = entry.predicate();
      var wasHidden = entry.wrap.hidden;

      if (!visible && !wasHidden) clearSection(entry.wrap);
      entry.wrap.hidden = !visible;
      syncRequired(entry.wrap, visible);
    }
  }

  register('plat-pc-other-wrap', checked('plat-pc-other'));
  register('plat-other-wrap', checked('plat-other'));
  register('qld-wrap', valueIs('dev_country', 'Australia'));
  register('qld-collab-wrap', checked('qld-yes'));
  register('cov-other-wrap', checked('cov-other'));
  register('release-wrap', checked('release-yes'));
  register('embargo-wrap', checked('embargo-yes'));
  register('safety-fieldset', checked('cov-stream'));
  register('key-wrap', checked('key-included'));
  register('sponsor-wrap', checked('sponsor'));

  form.addEventListener('change', syncAll);

  /* Dates are entered as UTC. datetime-local yields a bare wall-clock
   * string; + "Z" makes it an instant. Preview shows Brisbane. */

  var brisbaneFormat = null;
  try {
    brisbaneFormat = new Intl.DateTimeFormat('en-AU', {
      timeZone: BRISBANE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (err) {
    brisbaneFormat = null;
  }

  function bindDateField(prefix) {
    var dateInput = document.getElementById(prefix + '_date');
    var preview = document.getElementById(prefix + '-preview');
    var utcField = document.getElementById(prefix + '_utc');
    if (!dateInput) return;

    function update() {
      var parsed = dateInput.value ? new Date(dateInput.value + 'Z') : null;
      var valid = parsed && !isNaN(parsed.getTime());

      if (utcField) utcField.value = valid ? parsed.toISOString() : '';
      if (preview) {
        preview.textContent = valid && brisbaneFormat
          ? 'That is ' + brisbaneFormat.format(parsed) + ' for me in Brisbane.'
          : '';
      }
    }

    dateInput.addEventListener('input', update);
    dateInput.addEventListener('change', update);
    update();
  }

  bindDateField('release');
  bindDateField('embargo');

  syncAll();

  /* Submission. */

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || '';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var coverageChecked = form.querySelectorAll('input[name="coverage"]:checked').length;
    if (coverageChecked === 0) {
      setStatus('Please pick at least one thing you would like from me: stream, review, or something else.', 'error');
      return;
    }

    var button = form.querySelector('.req-submit');
    button.disabled = true;
    setStatus('Sending...', 'pending');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          syncAll();
          button.disabled = false;
          setStatus(
            'Sent. I read every one of these and will reply to the address you gave me.',
            'success'
          );
          if (window.turnstile) window.turnstile.reset();
        } else {
          button.disabled = false;
          setStatus(
            result.body && result.body.error
              ? result.body.error
              : 'Something went wrong. Email zigarot@zigarot.live instead.',
            'error'
          );
          if (window.turnstile) window.turnstile.reset();
        }
      })
      .catch(function () {
        button.disabled = false;
        setStatus('Network error. Email zigarot@zigarot.live instead.', 'error');
        if (window.turnstile) window.turnstile.reset();
      });
  });
})();

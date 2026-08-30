/*
 * POST /api/stream-request - handler for the /stream-my-game form.
 * Turnstile verify -> validate -> Resend.
 *
 * Pages env vars:
 *   TURNSTILE_SECRET_KEY
 *   RESEND_API_KEY
 *   MAIL_TO     zigarot@zigarot.live
 *   MAIL_FROM   Zigarot.live Forms <forms@zigarot.live>  (Resend-verified domain)
 */

const TIMEZONE = "Australia/Brisbane";
const REQUIRED_ENV = ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "MAIL_TO", "MAIL_FROM"];

/* Email layout and field order. Fields not listed here are not emailed -
 * add new form fields here too. */
const SECTIONS = [
  {
    title: "Essential info",
    fields: [
      ["game_title", "Game title"],
      ["dev_name", "Developer / company"],
      ["contact_email", "Contact email"],
      ["game_link", "Store / info link"],
      ["presskit_link", "Press kit"],
      ["game_description", "About the game"]
    ]
  },
  {
    title: "Platforms and studio",
    fields: [
      ["platforms", "Platforms"],
      ["platform_pc_other", "PC storefront (other)"],
      ["platform_other", "Other platform"],
      ["dev_country", "Based in"],
      ["qld_local", "Staff local to QLD"],
      ["qld_collab", "Collaboration suggested"]
    ]
  },
  {
    title: "Coverage",
    fields: [
      ["coverage", "Coverage wanted"],
      ["coverage_other", "Something else"],
      ["release", "Has a release date"],
      ["release_when", "Releases on"],
      ["embargo", "Has an embargo"],
      ["embargo_when", "Embargo lifts"]
    ]
  },
  {
    title: "Stream safety",
    fields: [["content_warnings", "Content warnings"]]
  },
  {
    title: "Logistics",
    fields: [
      ["optional_extras", "Extras"],
      ["game_key", "Game key"],
      ["sponsor_details", "Sponsorship offered"],
      ["other_info", "Anything else"],
      ["referral", "Heard about me via"]
    ]
  }
];

const REQUIRED = ["game_title", "dev_name", "contact_email", "game_description", "coverage"];

/* Server-side backstop to the form's maxlength attributes. */
const DEFAULT_LIMIT = 500;
const LIMITS = {
  contact_email: 254,
  game_link: 500,
  presskit_link: 500,
  game_description: 5000,
  coverage_other: 2000,
  qld_collab: 2000,
  sponsor_details: 2000,
  other_info: 5000
};
const MAX_VALUES_PER_FIELD = 20;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Control chars stripped, whitespace collapsed. For mail headers. */
function headerSafe(value, limit) {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit || 120);
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { "content-type": "application/json" }
  });
}

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  try {
    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: body }
    );
    const outcome = await result.json();
    if (outcome.success !== true) {
      console.error("Turnstile rejected: " + JSON.stringify(outcome["error-codes"] || []));
    }
    return outcome.success === true;
  } catch (err) {
    console.error("Turnstile verification threw: " + (err && err.message));
    return false;
  }
}

function formatInstant(date) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

/* Dates are entered as UTC. Prefers the ISO instant from form.js; falls
 * back to raw wall-clock + "Z" when JS is off. Returns Brisbane + UTC. */
function describeDate(utcValue, rawValue) {
  let parsed = null;

  if (utcValue) {
    const fromIso = new Date(utcValue);
    if (!isNaN(fromIso.getTime())) parsed = fromIso;
  }
  if (!parsed && rawValue) {
    const fromRaw = new Date(String(rawValue) + "Z");
    if (!isNaN(fromRaw.getTime())) parsed = fromRaw;
  }
  if (!parsed) return "";

  const utcLabel = parsed.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return formatInstant(parsed) + " AEST (" + utcLabel + ")";
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const missingEnv = REQUIRED_ENV.filter((key) => !env[key]);
  if (missingEnv.length > 0) {
    console.error("Missing environment variables: " + missingEnv.join(", "));
    return json(
      {
        error:
          "The form is not configured correctly right now. Please email zigarot@zigarot.live instead."
      },
      500
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch (err) {
    return json({ error: "Could not read the form submission." }, 400);
  }

  if (form.get("website")) {
    return json({ ok: true }, 200);
  }

  const passed = await verifyTurnstile(
    form.get("cf-turnstile-response"),
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("CF-Connecting-IP")
  );

  if (!passed) {
    return json({ error: "Spam check failed. Please reload the page and try again." }, 403);
  }

  /* Collect and cap before use. */
  const values = {};
  for (const section of SECTIONS) {
    for (const pair of section.fields) {
      const key = pair[0];
      const limit = LIMITS[key] || DEFAULT_LIMIT;
      const collected = form
        .getAll(key)
        .filter(Boolean)
        .slice(0, MAX_VALUES_PER_FIELD)
        .map((entry) => String(entry).trim().slice(0, limit))
        .filter(Boolean);
      if (collected.length > 0) values[key] = collected;
    }
  }

  const releaseWhen = describeDate(form.get("release_utc"), form.get("release_date"));
  if (releaseWhen) values.release_when = [releaseWhen];

  const embargoWhen = describeDate(form.get("embargo_utc"), form.get("embargo_date"));
  if (embargoWhen) values.embargo_when = [embargoWhen];

  for (const field of REQUIRED) {
    if (!values[field]) {
      return json({ error: "Please fill in every required field." }, 400);
    }
  }

  const coverage = values.coverage || [];
  if (coverage.indexOf("Other") !== -1 && !values.coverage_other) {
    return json(
      { error: "You ticked 'Something else' - please tell me what you had in mind." },
      400
    );
  }

  const extras = values.optional_extras || [];
  const sponsored = extras.indexOf("Wants to sponsor") !== -1;
  if (sponsored && !values.sponsor_details) {
    return json({ error: "Please describe the sponsored opportunity you are offering." }, 400);
  }

  const replyTo = values.contact_email[0];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    return json({ error: "That email address does not look valid." }, 400);
  }

  /* HTML and text built together to stay in sync. */
  const htmlParts = [];
  const textParts = [];

  for (const section of SECTIONS) {
    const rows = [];
    const lines = [];

    for (const pair of section.fields) {
      const key = pair[0];
      const label = pair[1];
      if (!values[key]) continue;
      const joined = values[key].join(", ");
      rows.push(
        '<tr><th align="left" valign="top" style="padding:4px 14px 4px 0;white-space:nowrap">' +
          escapeHtml(label) +
          '</th><td style="padding:4px 0">' +
          escapeHtml(joined).replace(/\n/g, "<br>") +
          "</td></tr>"
      );
      lines.push(label + ": " + joined);
    }

    if (rows.length === 0) continue;

    htmlParts.push(
      '<h3 style="margin:24px 0 6px">' +
        escapeHtml(section.title) +
        '</h3><table cellpadding="0" cellspacing="0" border="0">' +
        rows.join("") +
        "</table>"
    );
    textParts.push(section.title.toUpperCase() + "\n" + lines.join("\n"));
  }

  const title = headerSafe(values.game_title[0], 120);
  const dev = headerSafe(values.dev_name[0], 80);
  const country = request.headers.get("CF-IPCountry") || "unknown";
  const meta =
    "Received " + formatInstant(new Date()) + " AEST. Submitted from " + country + ".";

  const html =
    '<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">' +
    "<h2 style=\"margin:0\">" +
    escapeHtml(title) +
    '</h2><p style="margin:4px 0 0"><strong>' +
    escapeHtml(dev) +
    "</strong>" +
    (sponsored ? ' &mdash; <strong>sponsorship enquiry</strong>' : "") +
    "</p>" +
    htmlParts.join("") +
    '<p style="margin-top:28px;color:#666;font-size:12px">' +
    escapeHtml(meta) +
    "</p></div>";

  const text =
    title +
    "\n" +
    dev +
    (sponsored ? " - SPONSORSHIP ENQUIRY" : "") +
    "\n\n" +
    textParts.join("\n\n") +
    "\n\n" +
    meta +
    "\n";

  const subject =
    (sponsored ? "Sponsored request: " : "Stream request: ") + title + " (" + dev + ")";

  let send;
  try {
    send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: "Bearer " + env.RESEND_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.MAIL_TO],
        reply_to: replyTo,
        subject: headerSafe(subject, 200),
        html: html,
        text: text
      })
    });
  } catch (err) {
    console.error("Resend request threw: " + (err && err.message));
    return json(
      { error: "Could not send the request. Please email zigarot@zigarot.live instead." },
      502
    );
  }

  if (!send.ok) {
    console.error("Resend returned " + send.status + ": " + (await send.text()));
    return json(
      { error: "Could not send the request. Please email zigarot@zigarot.live instead." },
      502
    );
  }

  return json({ ok: true }, 200);
}

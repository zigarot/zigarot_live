/*
 * Config for /stream. Edit here, commit, done.
 *
 * video.hlsUrl   — MediaMTX HLS playlist. The path segment ("live") must match
 *                  the path name in mediamtx.yml. MediaMTX returns 404 on this
 *                  URL whenever nothing is publishing, which is exactly how the
 *                  page decides to show the offline card — no status API needed.
 *
 * video.retrySeconds — how often /stream re-probes while showing the offline
 *                  card. Keep this short: it is how long someone already
 *                  sitting on the page waits before the player kicks in.
 *
 * video.bannerPollSeconds — how often the homepage re-checks for its live
 *                  banner and link state. Can be much lazier; nobody is
 *                  waiting on it.
 *
 * chat.roomId    — room UUID only, from the Ninja Chatter dashboard URL
 *                  (the ?room= value, not the whole URL). Empty renders a setup
 *                  placeholder instead of the iframe. This UUID is public by
 *                  design: the read endpoint is unauthenticated so viewers can
 *                  connect. The ingress API key — the thing that can inject
 *                  messages — lives in Social Stream Ninja and never reaches
 *                  the browser.
 */
export default {
  video: {
    hlsUrl: "https://live.zigarot.live/live/index.m3u8",
    retrySeconds: 15,
    bannerPollSeconds: 120,
    offlineLogo: "/img/ZigLogoLight.png"
  },

  chat: {
    roomId: "1f9947f1-a8ca-45c8-8f99-a8c9b391b35c",
    embedBase: "https://ninjachatter.com",
    wsUrl: "wss://api.ninjachatter.com/ws"
  },

  /* Stream schedule. day: 0=Sun 1=Mon ... 6=Sat, in the timeZone below.
     Times are wall-clock in that zone; the page converts each one to the
     viewer's own timezone, which can shift the weekday as well as the hour.
     Australia/Brisbane has no DST, but the conversion asks Intl for the real
     offset at each instant, so a DST zone would still be correct here. */
  schedule: {
    timeZone: "Australia/Brisbane",
    slots: [
      { day: 0, hour: 17, minute: 0 },  /* Sun */
      { day: 1, hour: 17, minute: 0 },  /* Mon */
      { day: 4, hour: 17, minute: 0 },  /* Thu */
      { day: 5, hour: 18, minute: 0 },  /* Fri */
      { day: 6, hour: 17, minute: 0 }   /* Sat */
    ]
  },

  commands: [
    { name: "!uptime",    desc: "How long we've been live" }
  ]
};

/*
 * Rate card. Drives the /media-kit table AND the downloadable /rates.csv.
 * Edit once; both stay in sync.
 */
export default {
  currency: "AUD",
  abn: "40 704 110 708",
  gstNote: "Not registered for GST. All prices are GST-free.",

  items: [
    {
      name: "First impressions coverage",
      rate: "Free",
      detail: "Non-sponsored. Send a key and pitch the game via the request form. At least one 3-hour stream if it fits the channel."
    },
    {
      name: "Sponsored live stream",
      rate: "$175 / hour",
      detail: "First hour free. Dedicated sponsored segment with talking points, links and on-stream branding."
    },
    {
      name: "Campaign bundle",
      rate: "From $350",
      detail: "One sponsored stream, one shortform edit and one social post, delivered as a single campaign."
    },
    {
      name: "Sponsored scripted video",
      rate: "$500",
      detail: "Up to 10 minutes. Scripted, edited and published to YouTube with captions."
    },
    {
      name: "Highlights & social posts",
      rate: "$175 video / $80 static",
      detail: "Shortform vertical edit up to 90 seconds, or a static social post. Published across TikTok, Reels and Shorts."
    },
    {
      name: "Event & convention coverage",
      rate: "$200 / hour",
      detail: "In-person streaming via my channel or yours, including booth streaming and on-site event capture."
    },
    {
      name: "Appearances & hosting",
      rate: "$1,000 / day",
      detail: "On-site hosting, presenting and community engagement. Travel and accommodation additional."
    },
    {
      name: "Playtest & feedback session",
      rate: "$250",
      detail: "Two-hour structured playtest plus a written report covering first-time player experience, friction points and stream readability."
    },
    {
      name: "Stream branding",
      rate: "$50 / day",
      detail: "Persistent logo, panel and overlay placement across all streams for the booked period."
    },
    {
      name: "Voice work",
      rate: "$50",
      detail: "Per 30 seconds of finished audio. Trailer narration, in-game lines and promotional reads."
    }
  ],

  alsoAvailable: "Panel moderation and speaking, developer interviews, podcast segments, community events, tournaments, game jams, and retainer or ambassador packages are all available and negotiated separately. Ask.",

  terms: [
    {
      term: "Currency",
      detail: "All prices in Australian dollars (AUD)."
    },
    {
      term: "Deposit & payment",
      detail: "50% deposit for new clients, 30% for returning clients. Balance due net 30 from delivery."
    },
    {
      term: "Turnaround",
      detail: "Delivery within 7 days as standard. 48-hour rush available at +50%."
    },
    {
      term: "Usage rights",
      detail: "Organic re-sharing is free in perpetuity: repost my content unedited and credited on your own channels. Paid media and re-cut advertising use is licensed separately for 12 months at 25-50% of the base fee."
    },
    {
      term: "Travel",
      detail: "Based in Ipswich, Queensland. Travel and accommodation to be covered by the client for engagements outside Greater Brisbane and Ipswich."
    },
    {
      term: "Disclosure",
      detail: "All sponsored content is disclosed in line with ACCC and AANA guidance, and with Twitch and YouTube platform policy including US FTC requirements."
    },
    {
      term: "Accessibility",
      detail: "Live closed captions run on every stream, simultaneously across every platform I broadcast to."
    },
    {
      term: "Editorial",
      detail: "Sponsorship buys placement and effort, not a guaranteed positive verdict. My audience trusts me because I say what I actually think."
    }
  ]
};

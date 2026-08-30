/*
 * MONTHLY UPDATE POINT.
 * Everything on /media-kit reads from this file. Edit here, commit, done.
 * Sources: Twitch Creator Dashboard > Analytics (ACV, followers)
 *          TikTok / Instagram / YouTube native analytics (30-day views)
 *          Bluesky profile (followers)
 */
export default {
  asOf: "August 2026",

  headline: [
    {
      value: "15,000+",
      label: "Monthly video views",
      note: "TikTok, Instagram &amp; YouTube combined"
    },
    {
      value: "9.8",
      label: "Average concurrent viewers",
      note: "Twitch, 30-day average"
    },
    {
      value: "2,700",
      label: "Twitch followers",
      note: "Twitch Partner"
    },
    {
      value: "1,050",
      label: "Bluesky followers",
      note: "Primary social channel"
    }
  ],

  platforms: [
    {
      name: "Twitch",
      brand: "twitch",
      icon: "fa-twitch",
      handle: "/zigarot",
      url: "https://twitch.tv/zigarot",
      metrics: [
        { label: "Followers", value: "2,700" },
        { label: "Avg. concurrent viewers", value: "9.8" }
      ]
    },
    {
      name: "TikTok",
      brand: "tiktok",
      icon: "fa-tiktok",
      handle: "@zigarot.live",
      url: "https://www.tiktok.com/@zigarot.live",
      metrics: [
        { label: "Views, last 30 days", value: "5,500" }
      ]
    },
    {
      name: "YouTube",
      brand: "youtube",
      icon: "fa-youtube",
      handle: "@zigarotica",
      url: "https://www.youtube.com/@zigarotica",
      metrics: [
        { label: "Views, last 30 days", value: "4,800" }
      ]
    },
    {
      name: "Instagram",
      brand: "instagram",
      icon: "fa-instagram",
      handle: "@zigarot.live",
      url: "https://www.instagram.com/zigarot.live",
      metrics: [
        { label: "Views, last 30 days", value: "4,700" }
      ]
    },
    {
      name: "Bluesky",
      brand: "bluesky",
      icon: "fa-bluesky",
      handle: "@zigarot.live",
      url: "https://bsky.app/profile/zigarot.live",
      metrics: [
        { label: "Followers", value: "1,050" }
      ]
    }
  ]
};

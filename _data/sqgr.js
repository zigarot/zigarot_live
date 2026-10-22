// Screen Queensland Games Residency showcase - /screenqld-2026
// order = play order on stream
// capsule = Steam library_header (460x215); omit to show title placeholder
// url/cta override the steam store link + button text
// utm: Steamworks UTM Analytics, devs see zigarot traffic on their store stats

const utm = "?utm_source=zigarot.live&utm_medium=stream&utm_campaign=sqgr2026";
const cdn = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps";

export default {
  title: "Screen Queensland Games Residency 2026",
  twitchUrl: "https://www.twitch.tv/videos/2905738491",
  residencyUrl: "https://screenqueensland.com.au/games/games-residency/",
  utm,
  games: [
    {
      title: "The Isle of Lost Bees",
      dev: "Triple Bee Games",
      appId: 4489560,
      capsule: `${cdn}/4489560/219b0319536e68995fdb94be96c213f359f674dd/library_header.jpg`
    },
    {
      title: "Pirate Cowboy Cowboy Pirate",
      dev: "Glub Club",
      appId: 5200670,
      capsule: `${cdn}/5200670/9b72e26d78c9c108f1c18dddced67e59596babb9/library_header.jpg`
    },
    {
      title: "Momento",
      dev: "Fat Alien Cat & Nomo Studios",
      appId: 2474770,
      capsule: `${cdn}/2474770/cd703a3d72e2f6d086a3d227236bc3853fc98d57/library_header.jpg`
    },
    {
      // no steam page yet - links to charlie's site
      title: "Escape",
      dev: "Charlie Bean",
      url: "https://www.charliebean.au/",
      capsule: `https://images.squarespace-cdn.com/content/v1/66c4e8f177e44474f0db9943/fe598c28-485c-42c5-aa68-eb461810db86/IMG_4576.png`,
      cta: "Visit the developer"
    },
    {
      title: "Key Fairy",
      dev: "Owl Machine",
      appId: 2878580,
      capsule: `${cdn}/2878580/57602094eda629a9267a494ad16aff21a76eccff/library_header.jpg`
    },
    {
      title: "Super Pain Toad Carnage",
      dev: "Cosmic Black Studios",
      appId: 4470840,
      capsule: `${cdn}/4470840/389a41b1b3d1bee282125abd99030c9aeab457e6/library_header.jpg`
    },
    {
      title: "Stonefall",
      dev: "Cosmic Black Studios & Vertex Ascent",
      appId: 5029770,
      capsule: `${cdn}/5029770/79eb4b99ca33bf3f465e9439e772ad5f734a9363/library_header.jpg`
    }
  ]
};

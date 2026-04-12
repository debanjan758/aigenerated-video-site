import { Clip, VideoInfo } from "../types";

const categories = ["Hook", "Funny", "Emotional", "Educational", "Trending", "Motivational"];
const copyrightLevels: Array<"Safe" | "Low Risk" | "Medium Risk"> = ["Safe", "Safe", "Safe", "Low Risk", "Low Risk", "Medium Risk"];

const hookReasons = [
  "Opens with a shocking statement that creates instant curiosity gap",
  "First 3 seconds feature a bold visual hook that stops the scroll",
  "Starts with a relatable problem millions of viewers face daily",
  "Begins with a counter-intuitive claim that challenges common belief",
  "Opens with fast-paced action that triggers dopamine response immediately",
  "Features a dramatic before/after reveal teased in the opening frame",
  "Starts with a strong emotional trigger that resonates universally",
  "Opens with humor that disarms viewers and builds immediate rapport",
  "Begins with a question that activates the curiosity loop mechanism",
  "Features a trending sound/format that boosts algorithmic discoverability",
];

const motivationalReasons = [
  "Highly shareable motivational segment with universal life lessons",
  "Inspirational story arc that viewers will tag friends in comments",
  "Powerful mindset shift moment that generates massive save rates",
  "Emotional peak moment perfect for motivational content creators",
  "Life advice segment with high re-watch and screenshot potential",
];

const educationalReasons = [
  "Dense information packed in under 60 seconds — maximum value per second",
  "Surprising fact that makes viewers feel smarter after watching",
  "Step-by-step tutorial format that drives high completion rates",
  "Expert insight that positions the clip as must-share content",
  "Data-backed claims that give viewers shareable talking points",
];

const funnyReasons = [
  "Comedy timing is perfect — punchline lands at ideal Shorts length",
  "Relatable humor that triggers comment wars and shares",
  "Unexpected twist ending that drives re-watch loops",
  "Physical comedy segment with broad cross-demographic appeal",
  "Witty wordplay that generates quote-comments and shares",
];

const trendingReasons = [
  "Aligns perfectly with current TikTok/Shorts trending audio format",
  "Contains a viral challenge moment ready to inspire duets",
  "Trend-jacking opportunity with existing high-search-volume topic",
  "Moment matches a current meme template circulating on social media",
  "Culturally relevant reference with strong zeitgeist potential",
];

const emotionalReasons = [
  "Authentic emotional moment that triggers empathy and shares",
  "Heartwarming story beat that generates positive community engagement",
  "Vulnerable moment that humanizes the creator and builds deep connection",
  "Tear-jerking segment that drives emotional saves and re-watches",
  "Feel-good content that viewers will share to brighten someone's day",
];

function getReasonForCategory(category: string): string {
  switch (category) {
    case "Hook": return hookReasons[Math.floor(Math.random() * hookReasons.length)];
    case "Motivational": return motivationalReasons[Math.floor(Math.random() * motivationalReasons.length)];
    case "Educational": return educationalReasons[Math.floor(Math.random() * educationalReasons.length)];
    case "Funny": return funnyReasons[Math.floor(Math.random() * funnyReasons.length)];
    case "Trending": return trendingReasons[Math.floor(Math.random() * trendingReasons.length)];
    case "Emotional": return emotionalReasons[Math.floor(Math.random() * emotionalReasons.length)];
    default: return hookReasons[Math.floor(Math.random() * hookReasons.length)];
  }
}

const hashtagSets: Record<string, string[]> = {
  Hook: ["#shorts", "#viral", "#trending", "#fyp", "#hookcontent", "#viralvideo", "#youtubeshorts"],
  Funny: ["#shorts", "#funny", "#comedy", "#lol", "#humor", "#funnyvideo", "#laugh"],
  Emotional: ["#shorts", "#emotional", "#heartwarming", "#feelgood", "#inspiring", "#touching", "#story"],
  Educational: ["#shorts", "#learnontiktok", "#educational", "#didyouknow", "#facts", "#knowledge", "#mindblowing"],
  Trending: ["#shorts", "#trending", "#viral", "#fyp", "#foryoupage", "#trend", "#viral2025"],
  Motivational: ["#shorts", "#motivation", "#mindset", "#success", "#hustle", "#grindset", "#inspiration"],
};

const viewRanges = [
  "800K–1.2M", "500K–900K", "1M–2.5M", "300K–700K", "2M–5M",
  "400K–800K", "1.5M–3M", "600K–1.1M", "250K–600K", "900K–1.8M",
];

const thumbnailColors = [
  "from-red-500 to-orange-500",
  "from-purple-600 to-pink-500",
  "from-blue-500 to-cyan-400",
  "from-green-500 to-teal-400",
  "from-yellow-500 to-orange-400",
  "from-indigo-600 to-purple-500",
  "from-pink-500 to-rose-400",
  "from-cyan-500 to-blue-400",
  "from-emerald-500 to-green-400",
  "from-fuchsia-500 to-purple-400",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateClips(videoId: string, videoInfo: VideoInfo): Clip[] {
  const clips: Clip[] = [];
  const rand = seededRandom(videoId.split("").reduce((a, c) => a + c.charCodeAt(0), 0));

  // Parse video duration to seconds (estimate ~10-30 min for most videos)
  const totalDurationSeconds = 1200 + Math.floor(rand() * 600);

  for (let i = 0; i < 100; i++) {
    const rnd = rand;
    const categoryIndex = Math.floor(rnd() * categories.length);
    const category = categories[categoryIndex];
    const copyrightRiskIndex = Math.floor(rnd() * copyrightLevels.length);
    const copyrightRisk = copyrightLevels[copyrightRiskIndex];

    // Generate clip duration between 15-58 seconds (optimal for Shorts)
    const clipDuration = 15 + Math.floor(rnd() * 44);

    // Generate start time spread across the video
    const maxStart = totalDurationSeconds - clipDuration;
    const startSeconds = Math.floor(rnd() * maxStart);
    const endSeconds = startSeconds + clipDuration;

    // Viral score biased toward high scores (60-99)
    const viralScore = Math.floor(60 + rnd() * 39);

    // Engagement metrics
    const hookStrength = Math.floor(65 + rnd() * 35);
    const shareability = Math.floor(60 + rnd() * 40);
    const retention = Math.floor(55 + rnd() * 45);

    const viewRangeIdx = Math.floor(rnd() * viewRanges.length);
    const thumbnailIdx = Math.floor(rnd() * thumbnailColors.length);

    const clip: Clip = {
      id: `clip-${i + 1}-${videoId}`,
      title: generateClipTitle(videoInfo.title, category, i + 1),
      startTime: formatTime(startSeconds),
      endTime: formatTime(endSeconds),
      duration: `${clipDuration}s`,
      viralScore,
      reason: getReasonForCategory(category),
      hashtags: hashtagSets[category] || hashtagSets["Hook"],
      thumbnail: thumbnailColors[thumbnailIdx],
      category,
      copyrightRisk,
      engagement: {
        estimatedViews: viewRanges[viewRangeIdx],
        shareability,
        hookStrength,
        retention,
      },
      posted: {
        youtube: false,
        instagram: false,
      },
    };

    clips.push(clip);
  }

  // Sort by viral score descending
  return clips.sort((a, b) => b.viralScore - a.viralScore);
}

function generateClipTitle(videoTitle: string, category: string, index: number): string {
  const categoryTitles: Record<string, string[]> = {
    Hook: [
      `You won't believe this moment from "${shortenTitle(videoTitle)}"`,
      `The opening hook that broke the internet 🔥`,
      `This 30-second clip changed everything`,
      `Stop scrolling — this is important`,
      `The hook that went viral overnight`,
    ],
    Funny: [
      `The funniest moment in "${shortenTitle(videoTitle)}" 😂`,
      `I can't stop rewatching this hilarious part`,
      `Nobody expected this to happen 💀`,
      `The unexpected twist that broke everyone`,
      `Pure comedy gold from this video`,
    ],
    Emotional: [
      `This moment made me tear up 😢`,
      `The most touching part of the video`,
      `Real talk — this hit different`,
      `You need to see this emotional moment`,
      `The part that gave everyone chills`,
    ],
    Educational: [
      `Mind-blowing fact you didn't know 🤯`,
      `Learn this in under 60 seconds`,
      `The insight that changes everything`,
      `Most people don't know this...`,
      `Quick lesson: ${shortenTitle(videoTitle)}`,
    ],
    Trending: [
      `This is going viral RIGHT NOW 🚀`,
      `Everyone is talking about this moment`,
      `The trending clip from "${shortenTitle(videoTitle)}"`,
      `Why this blew up overnight 📈`,
      `Algorithm-approved gold from this video`,
    ],
    Motivational: [
      `The best advice I've ever heard 💪`,
      `This changed my mindset forever`,
      `Save this for when you need motivation`,
      `The most powerful moment in the video`,
      `Life-changing wisdom in 60 seconds`,
    ],
  };

  const titles = categoryTitles[category] || categoryTitles["Hook"];
  return titles[index % titles.length];
}

function shortenTitle(title: string): string {
  return title.length > 30 ? title.substring(0, 30) + "..." : title;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If it looks like just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

export function getMockVideoInfo(videoId: string, _url: string): VideoInfo {
  const titles = [
    "How I Built a $10M Business From Nothing",
    "The Ultimate Guide to Going Viral in 2025",
    "10 Life Lessons That Changed My Life Forever",
    "Why Most People Never Achieve Their Dreams",
    "The Secret Formula Behind Every Viral Video",
    "I Tried Every Content Strategy for 30 Days",
    "The Truth About Social Media That Nobody Tells You",
    "How to Grow 100K Followers in 90 Days",
  ];

  const channels = [
    "Alex Hormozi", "MrBeast", "Nas Daily", "Mark Rober",
    "Andrew Huberman", "Veritasium", "MKBHD", "GaryVee",
  ];

  const seed = videoId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const titleIdx = seed % titles.length;
  const channelIdx = (seed + 3) % channels.length;

  return {
    title: titles[titleIdx],
    channel: channels[channelIdx],
    duration: `${Math.floor(seed % 30) + 8}:${(seed % 60).toString().padStart(2, "0")}`,
    thumbnailUrl: "",
    videoId,
  };
}

import "dotenv/config";

import type { PersonaConfig, RuntimeConfig } from "./types.js";

export const persona: PersonaConfig = {
  brandName: "SignalMint AI",
  handle: "@signalmintai",
  niche: "turning creator knowledge into tiny digital products and affiliate revenue",
  audience: "solo creators and consultants who want income from audience-first content",
  disclosure: "AI-run brand account. Posts are automated and reviewed periodically.",
  growthGoal: "maximize 30-day reach, profile visits, follows, and offer clicks with clean distribution",
  voice: ["direct", "useful", "short", "commercial without sounding desperate"],
  contentPillars: ["education", "opinion", "proof", "offer"],
  formats: ["contrarian", "checklist", "mistake", "framework", "proof", "offer"],
  topicClusters: [
    "creator monetization",
    "digital products",
    "affiliate funnels",
    "audience conversion",
    "offer design"
  ],
  problemAngles: [
    "people post for months without a clean offer",
    "most creators bury the CTA until nobody clicks",
    "audiences do not buy vague expertise",
    "small accounts can monetize before they go viral",
    "consistency matters less than clarity"
  ],
  transformations: [
    "turn one skill into a low-ticket product",
    "use one CTA across 30 days of posts",
    "convert free attention into email subscribers",
    "package case studies into offers people understand",
    "sell outcomes instead of generic content"
  ],
  proofPoints: [
    "the fastest revenue usually comes from one focused problem",
    "buyers respond better to specifics than to motivation",
    "short posts can validate an offer before you build a full product",
    "a clear landing page beats more posting volume",
    "simple affiliate funnels outperform random links"
  ],
  socialProofTemplates: [
    "The posts that spread usually make the reader feel understood in under 2 seconds",
    "Proof beats motivation when people decide whether to follow",
    "Specific outcomes get saved and shared more than generic inspiration",
    "Clear positioning creates stronger second-degree distribution",
    "A useful post with one sharp idea travels further than a thread full of filler"
  ],
  clickHooks: [
    "Save this if you want the playbook later.",
    "This is worth bookmarking before you rewrite your profile or offer.",
    "Keep this framework nearby when you plan your next 10 posts.",
    "Use this before you publish another post that gets ignored."
  ],
  hookTemplates: [
    "Most people get this wrong:",
    "Unpopular but true:",
    "If I had to grow from 0 again, I would do this:",
    "The mistake keeping small accounts small:",
    "This is where creators leave money on the table:"
  ],
  replyPrompts: [
    "Reply \"guide\" if you want the template.",
    "Reply \"audit\" if you want the checklist.",
    "Reply \"stack\" if you want the tool stack.",
    "Reply \"offer\" if you want the framework."
  ],
  trendFeeds: [
    {
      name: "Google News Top Stories US",
      url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
      category: "top-stories"
    },
    {
      name: "Google News Business US",
      url: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
      category: "business"
    },
    {
      name: "Google News Technology US",
      url: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
      category: "technology"
    },
    {
      name: "Google News World US",
      url: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
      category: "world"
    },
    {
      name: "Google News Entertainment US",
      url: "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
      category: "entertainment"
    }
  ],
  trendHooks: [
    "Big story today:",
    "Worth watching today:",
    "This headline matters:",
    "If you care about leverage online, pay attention to this:"
  ],
  offers: [
    {
      name: "Creator Offer Teardown",
      url: "https://example.com/teardown",
      cta: "Reply \"teardown\" and grab the breakdown here",
      kind: "lead-magnet"
    },
    {
      name: "Micro Product Playbook",
      url: "https://example.com/playbook",
      cta: "Steal the playbook here",
      kind: "product"
    },
    {
      name: "Revenue Stack Toolkit",
      url: "https://example.com/toolkit",
      cta: "See the toolkit I would start with",
      kind: "affiliate"
    }
  ]
};

export const runtime: RuntimeConfig = {
  dryRun: process.env.DRY_RUN !== "false",
  queueTarget: Number.parseInt(process.env.QUEUE_TARGET ?? "14", 10),
  postsPerRun: Number.parseInt(process.env.POSTS_PER_RUN ?? "1", 10),
  trendPostsPerRun: Number.parseInt(process.env.TREND_POSTS_PER_RUN ?? "1", 10),
  trendAutoPost: process.env.TREND_AUTO_POST === "true",
  breakingPostsPerRun: Number.parseInt(process.env.BREAKING_POSTS_PER_RUN ?? "3", 10),
  breakingStoryLimit: Number.parseInt(process.env.BREAKING_STORY_LIMIT ?? "6", 10)
};

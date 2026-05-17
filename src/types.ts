export type ContentPillar = "education" | "opinion" | "proof" | "offer";
export type PostFormat = "contrarian" | "checklist" | "mistake" | "framework" | "proof" | "offer";

export type Offer = {
  name: string;
  url: string;
  cta: string;
  kind: "affiliate" | "lead-magnet" | "product" | "service";
};

export type TrendFeed = {
  name: string;
  url: string;
  category: string;
};

export type PersonaConfig = {
  brandName: string;
  handle: string;
  niche: string;
  audience: string;
  disclosure: string;
  growthGoal: string;
  voice: string[];
  contentPillars: ContentPillar[];
  formats: PostFormat[];
  topicClusters: string[];
  problemAngles: string[];
  transformations: string[];
  proofPoints: string[];
  socialProofTemplates: string[];
  clickHooks: string[];
  hookTemplates: string[];
  replyPrompts: string[];
  trendFeeds: TrendFeed[];
  trendHooks: string[];
  offers: Offer[];
};

export type EngagementPrediction = {
  likes: number;
  replies: number;
  reposts: number;
  clicks: number;
  bookmarks: number;
  follows: number;
  negativeFeedbackRisk: number;
};

export type QueueItem = {
  id: string;
  createdAt: string;
  source: "evergreen" | "trend";
  pillar: ContentPillar;
  format: PostFormat;
  topicCluster: string;
  text: string;
  predictedScore: number;
  visibilityRisk: number;
  prediction: EngagementPrediction;
  experimentTag: string;
  offerName?: string;
  trendRef?: {
    headline: string;
    source: string;
    url: string;
    publishedAt?: string;
  };
  status: "queued" | "posted" | "failed";
  postedAt?: string;
};

export type RuntimeConfig = {
  dryRun: boolean;
  queueTarget: number;
  postsPerRun: number;
  trendPostsPerRun: number;
  trendAutoPost: boolean;
};

export type PerformanceRecord = {
  queueId: string;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  bookmarks: number;
  linkClicks: number;
  follows: number;
};

export type TrendStory = {
  id: string;
  source: string;
  category: string;
  headline: string;
  url: string;
  publishedAt?: string;
  freshnessScore: number;
  trendScore: number;
};

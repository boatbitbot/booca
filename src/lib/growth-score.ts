import type { EngagementPrediction, QueueItem } from "../types.js";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function predictEngagement(text: string, hasOffer: boolean): EngagementPrediction {
  let likes = 25;
  let replies = 18;
  let reposts = 14;
  let clicks = 16;
  let bookmarks = 12;
  let follows = 8;
  let negativeFeedbackRisk = 8;

  if (text.includes("Unpopular")) {
    likes += 10;
    replies += 11;
    reposts += 6;
  }

  if (text.includes("Most people") || text.includes("mistake")) {
    replies += 6;
    likes += 5;
  }

  if (/\b3\b|\b5\b|\b7\b/.test(text)) {
    bookmarks += 12;
    clicks += 8;
    reposts += 4;
  }

  if (text.includes("framework") || text.includes("Hook -> pain -> proof -> CTA")) {
    bookmarks += 10;
    follows += 4;
  }

  if (text.includes("Reply")) {
    replies += 8;
    negativeFeedbackRisk += 5;
  }

  if (text.includes("Save this") || text.includes("bookmark")) {
    bookmarks += 8;
    clicks += 5;
  }

  if (text.includes("proof") || text.includes("specific")) {
    reposts += 5;
    follows += 4;
  }

  if (text.length >= 170 && text.length <= 250) {
    likes += 5;
    clicks += 6;
    bookmarks += 4;
  }

  if (hasOffer) {
    clicks += 10;
    likes -= 4;
    reposts -= 3;
    negativeFeedbackRisk += 6;
  } else {
    follows += 3;
  }

  if ((text.match(/!/g) ?? []).length > 1) {
    negativeFeedbackRisk += 10;
  }

  if (text.toUpperCase() === text && text.length > 10) {
    negativeFeedbackRisk += 20;
  }

  return {
    likes: clamp(likes),
    replies: clamp(replies),
    reposts: clamp(reposts),
    clicks: clamp(clicks),
    bookmarks: clamp(bookmarks),
    follows: clamp(follows),
    negativeFeedbackRisk: clamp(negativeFeedbackRisk)
  };
}

export function scorePost(text: string, hasOffer: boolean): {
  predictedScore: number;
  visibilityRisk: number;
  prediction: EngagementPrediction;
} {
  const prediction = predictEngagement(text, hasOffer);
  const predictedScore =
    prediction.likes * 0.16 +
    prediction.replies * 0.2 +
    prediction.reposts * 0.18 +
    prediction.clicks * 0.16 +
    prediction.bookmarks * 0.16 +
    prediction.follows * 0.14 -
    prediction.negativeFeedbackRisk * 0.18;

  return {
    predictedScore: clamp(Math.round(predictedScore)),
    visibilityRisk: prediction.negativeFeedbackRisk,
    prediction
  };
}

export function rankByPredictedScore(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => b.predictedScore - a.predictedScore || a.visibilityRisk - b.visibilityRisk);
}

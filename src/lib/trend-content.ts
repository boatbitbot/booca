import { persona } from "../config.js";
import type { QueueItem, TrendStory } from "../types.js";
import { scorePost } from "./growth-score.js";
import { passesQualityFilter } from "./quality-filter.js";
import { pickOne, slugify, truncateForX } from "./utils.js";

function buildTrendText(story: TrendStory, seed: number): string {
  const hook = pickOne(persona.trendHooks, seed);
  const lesson = pickOne(persona.socialProofTemplates, seed + 1);
  const prompt = pickOne(persona.replyPrompts, seed + 2);

  return truncateForX(
    `${hook} ${story.headline}\n\nSource: ${story.source}.\n\nTake: ${lesson}.\n\n${prompt}`
  );
}

export function createTrendQueueItems(stories: TrendStory[], limit: number, offset = 0): QueueItem[] {
  const generated: QueueItem[] = stories.slice(0, limit).map((story, index) => {
    const seed = offset + index;
    const text = buildTrendText(story, seed);
    const scored = scorePost(text, false);

    return {
      id: `trend-${slugify(story.source)}-${story.id}`,
      createdAt: new Date().toISOString(),
      source: "trend",
      pillar: "opinion",
      format: "proof",
      topicCluster: story.category,
      text,
      predictedScore: Math.round(scored.predictedScore * 0.7 + story.trendScore * 0.3),
      visibilityRisk: scored.visibilityRisk,
      prediction: scored.prediction,
      experimentTag: `trend-proof-${slugify(story.category)}`,
      trendRef: {
        headline: story.headline,
        source: story.source,
        url: story.url,
        publishedAt: story.publishedAt
      },
      status: "queued"
    };
  });

  return generated.filter(passesQualityFilter);
}

export type BreakingDraft = {
  id: string;
  source: "trend";
  mode: "breaking";
  draftType: "fast-take" | "why-it-matters" | "contrarian-angle" | "prediction" | "creator-angle";
  headline: string;
  storyUrl: string;
  storySource: string;
  topicCluster: string;
  text: string;
  predictedScore: number;
  visibilityRisk: number;
};

function buildBreakingText(
  story: TrendStory,
  draftType: BreakingDraft["draftType"],
  seed: number
): string {
  const proof = pickOne(persona.socialProofTemplates, seed + 1);
  const hook = pickOne(persona.trendHooks, seed + 2);
  const transformation = pickOne(persona.transformations, seed + 3);

  if (draftType === "fast-take") {
    return truncateForX(
      `${hook} ${story.headline}\n\nFast take: ${proof}\n\nSource: ${story.source}`
    );
  }

  if (draftType === "why-it-matters") {
    return truncateForX(
      `Why this matters right now:\n${story.headline}\n\nIf this keeps moving, creators and operators should pay attention early, not after the conversation is crowded.\n\nSource: ${story.source}`
    );
  }

  if (draftType === "prediction") {
    return truncateForX(
      `Prediction:\n${story.headline}\n\nThe next wave of posts will repeat the news. The winners will explain what changes next and who benefits first.\n\nSource: ${story.source}`
    );
  }

  if (draftType === "creator-angle") {
    return truncateForX(
      `Creator angle:\n${story.headline}\n\nBest move: ${transformation} before the topic gets saturated.\n\nSource: ${story.source}`
    );
  }

  return truncateForX(
    `Contrarian take:\nMost people will repeat the headline. Better post: explain the second-order effect.\n\n${story.headline}\n\nSource: ${story.source}`
  );
}

export function createBreakingDrafts(stories: TrendStory[], storyLimit = 5): BreakingDraft[] {
  const draftTypes: BreakingDraft["draftType"][] = [
    "fast-take",
    "why-it-matters",
    "contrarian-angle",
    "prediction",
    "creator-angle"
  ];
  const drafts: BreakingDraft[] = [];

  stories.slice(0, storyLimit).forEach((story, storyIndex) => {
    draftTypes.forEach((draftType, typeIndex) => {
      const seed = storyIndex * 10 + typeIndex;
      const text = buildBreakingText(story, draftType, seed);
      const scored = scorePost(text, false);

      const draft: BreakingDraft = {
        id: `breaking-${slugify(story.source)}-${story.id}-${draftType}`,
        source: "trend",
        mode: "breaking",
        draftType,
        headline: story.headline,
        storyUrl: story.url,
        storySource: story.source,
        topicCluster: story.category,
        text,
        predictedScore: Math.round(scored.predictedScore * 0.65 + story.trendScore * 0.35),
        visibilityRisk: scored.visibilityRisk
      };

      if (passesQualityFilter({
        id: draft.id,
        createdAt: new Date().toISOString(),
        source: "trend",
        pillar: "opinion",
        format: "proof",
        topicCluster: draft.topicCluster,
        text: draft.text,
        predictedScore: draft.predictedScore,
        visibilityRisk: draft.visibilityRisk,
        prediction: scored.prediction,
        experimentTag: `breaking-${draft.draftType}-${slugify(draft.topicCluster)}`,
        status: "queued"
      })) {
        drafts.push(draft);
      }
    });
  });

  return drafts.sort((a, b) => b.predictedScore - a.predictedScore || a.visibilityRisk - b.visibilityRisk);
}

export function createBreakingQueueItems(stories: TrendStory[], storyLimit = 5): QueueItem[] {
  return createBreakingDrafts(stories, storyLimit).map((draft) => {
    const scored = scorePost(draft.text, false);

    return {
      id: draft.id,
      createdAt: new Date().toISOString(),
      source: "trend",
      mode: "breaking",
      draftType: draft.draftType,
      pillar: "opinion",
      format: "proof",
      topicCluster: draft.topicCluster,
      text: draft.text,
      predictedScore: draft.predictedScore,
      visibilityRisk: draft.visibilityRisk,
      prediction: scored.prediction,
      experimentTag: `breaking-${draft.draftType}-${slugify(draft.topicCluster)}`,
      trendRef: {
        headline: draft.headline,
        source: draft.storySource,
        url: draft.storyUrl
      },
      status: "queued"
    };
  });
}

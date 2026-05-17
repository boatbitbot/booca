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

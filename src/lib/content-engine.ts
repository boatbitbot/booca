import { persona } from "../config.js";
import type { ContentPillar, PostFormat, QueueItem } from "../types.js";
import { rankByPredictedScore, scorePost } from "./growth-score.js";
import { maybeAttachOffer } from "./monetization.js";
import { diversifyQueue, passesQualityFilter } from "./quality-filter.js";
import { capitalize, pickOne, rotate, slugify, truncateForX } from "./utils.js";

function buildEducation(seed: number): string {
  const angle = pickOne(persona.problemAngles, seed);
  const transformation = pickOne(persona.transformations, seed + 1);
  const hook = pickOne(persona.hookTemplates, seed + 2);
  const clickHook = pickOne(persona.clickHooks, seed + 3);

  return truncateForX(
    [
      `${hook}`,
      `${capitalize(angle)}.`,
      `Better move: ${transformation}.`,
      `${clickHook}`
    ].join(" ")
  );
}

function buildOpinion(seed: number): string {
  const point = pickOne(persona.proofPoints, seed);
  const replyPrompt = pickOne(persona.replyPrompts, seed + 1);

  return truncateForX(
    `Unpopular opinion: ${capitalize(point)}. Attention without a monetization path is just unpaid labor.\n\n${replyPrompt}`
  );
}

function buildProof(seed: number): string {
  const angle = pickOne(persona.problemAngles, seed);
  const point = pickOne(persona.proofPoints, seed + 2);
  const proof = pickOne(persona.socialProofTemplates, seed + 4);

  return truncateForX(
    `A good revenue post does 3 things fast: names the pain, frames the outcome, and points to one next step. ${capitalize(point)}. ${capitalize(angle)}. ${proof}.`
  );
}

function buildOffer(seed: number): string {
  const transformation = pickOne(persona.transformations, seed);
  const replyPrompt = pickOne(persona.replyPrompts, seed + 3);

  return truncateForX(
    `If you want to ${transformation}, stop chasing more content ideas and fix the offer path first.\n\n${replyPrompt}`
  );
}

function buildChecklist(seed: number): string {
  const angle = pickOne(persona.problemAngles, seed);
  const transformation = pickOne(persona.transformations, seed + 1);
  const clickHook = pickOne(persona.clickHooks, seed + 2);

  return truncateForX(
    `3 fixes for creators stuck at low reach:\n1. Name one painful problem.\n2. Point to one clear outcome.\n3. Tie every post to ${transformation}.\n\n${capitalize(angle)}.\n\n${clickHook}`
  );
}

function buildFramework(seed: number): string {
  const point = pickOne(persona.proofPoints, seed);
  return truncateForX(
    `Simple growth framework:\nHook -> pain -> proof -> CTA.\n\n${capitalize(point)}. That is how small accounts turn attention into clicks.`
  );
}

function buildMistake(seed: number): string {
  const angle = pickOne(persona.problemAngles, seed);
  return truncateForX(
    `The mistake keeping small accounts small:\nPosting broad advice that nobody feels emotionally.\n\n${capitalize(angle)}.`
  );
}

function buildBaseText(pillar: ContentPillar, format: PostFormat, seed: number): string {
  if (format === "checklist") return buildChecklist(seed);
  if (format === "framework") return buildFramework(seed);
  if (format === "mistake") return buildMistake(seed);

  switch (pillar) {
    case "education":
      return buildEducation(seed);
    case "opinion":
      return buildOpinion(seed);
    case "proof":
      return buildProof(seed);
    case "offer":
      return buildOffer(seed);
  }
}

export function generateQueueItems(count: number, offset = 0): QueueItem[] {
  const pillars = rotate(persona.contentPillars, count + offset).slice(offset, offset + count);
  const formats = rotate(persona.formats, count + offset).slice(offset, offset + count);
  const topicClusters = rotate(persona.topicClusters, count + offset).slice(offset, offset + count);

  const generated: QueueItem[] = pillars.map((pillar, index) => {
    const slot = index + offset;
    const format = formats[index];
    const topicCluster = topicClusters[index];
    const baseText = buildBaseText(pillar, format, slot);
    const offer = persona.offers[slot % persona.offers.length];
    const monetized = maybeAttachOffer(baseText, offer, slot);
    const id = `${slugify(pillar)}-${Date.now()}-${slot}`;
    const scored = scorePost(monetized.text, Boolean(monetized.offerName));

    return {
      id,
      createdAt: new Date().toISOString(),
      source: "evergreen",
      pillar,
      format,
      topicCluster,
      text: monetized.text,
      predictedScore: scored.predictedScore,
      visibilityRisk: scored.visibilityRisk,
      prediction: scored.prediction,
      experimentTag: `${pillar}-${format}-${slugify(topicCluster)}`,
      offerName: monetized.offerName,
      status: "queued"
    };
  });

  return diversifyQueue(rankByPredictedScore(generated.filter(passesQualityFilter)));
}

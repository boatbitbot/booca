import crypto from "node:crypto";

import { persona } from "../config.js";
import type { TrendStory } from "../types.js";

function decodeXml(input: string): string {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? decodeXml(match[1].trim()) : undefined;
}

function scoreFreshness(publishedAt?: string): number {
  if (!publishedAt) return 40;
  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return 40;

  const hours = Math.max(0, (Date.now() - published) / (1000 * 60 * 60));
  if (hours <= 3) return 100;
  if (hours <= 6) return 88;
  if (hours <= 12) return 75;
  if (hours <= 24) return 60;
  if (hours <= 48) return 45;
  return 25;
}

function scoreHeadline(headline: string, category: string): number {
  let score = 45;
  const lower = headline.toLowerCase();

  if (/\bhow\b|\bwhy\b|\bwhat\b/.test(lower)) score += 4;
  if (/\bai\b|\bcreator\b|\bbusiness\b|\bstartup\b|\bmarket\b|\bpolicy\b|\blaunch\b/.test(lower)) score += 14;
  if (/\btrump\b|\bmusk\b|\bapple\b|\bgoogle\b|\bopenai\b|\bmicrosoft\b|\bmeta\b/.test(lower)) score += 10;
  if (/\bwarns\b|\bannounces\b|\bplans\b|\bbans\b|\bdeal\b|\bcuts\b|\bsues\b/.test(lower)) score += 8;
  if (category === "technology" || category === "business") score += 8;
  if (headline.length >= 55 && headline.length <= 110) score += 5;

  return Math.min(score, 100);
}

function toStory(itemXml: string, source: string, category: string): TrendStory | undefined {
  const headline = extractTag(itemXml, "title");
  const url = extractTag(itemXml, "link");
  const publishedAt = extractTag(itemXml, "pubDate");

  if (!headline || !url) {
    return undefined;
  }

  const freshnessScore = scoreFreshness(publishedAt);
  const trendScore = Math.round(freshnessScore * 0.55 + scoreHeadline(headline, category) * 0.45);

  return {
    id: crypto.createHash("sha1").update(`${source}|${headline}|${url}`).digest("hex").slice(0, 16),
    source,
    category,
    headline,
    url,
    publishedAt,
    freshnessScore,
    trendScore
  };
}

export async function fetchTrendStories(): Promise<TrendStory[]> {
  const allStories: TrendStory[] = [];

  for (const feed of persona.trendFeeds) {
    const response = await fetch(feed.url, {
      headers: {
        "user-agent": `${persona.brandName} trend fetcher`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${feed.name}: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

    for (const itemXml of items) {
      const story = toStory(itemXml, feed.name, feed.category);
      if (story) {
        allStories.push(story);
      }
    }
  }

  const unique = new Map<string, TrendStory>();

  for (const story of allStories) {
    const key = story.headline.toLowerCase();
    const existing = unique.get(key);
    if (!existing || story.trendScore > existing.trendScore) {
      unique.set(key, story);
    }
  }

  return [...unique.values()].sort((a, b) => b.trendScore - a.trendScore).slice(0, 25);
}

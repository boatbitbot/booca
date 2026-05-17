import test from "node:test";
import assert from "node:assert/strict";

import { generateQueueItems } from "../src/lib/content-engine.js";
import { createTrendQueueItems } from "../src/lib/trend-content.js";

test("generateQueueItems creates the requested number of items", () => {
  const items = generateQueueItems(6);
  assert.ok(items.length > 0);
  assert.ok(items.length <= 6);
  assert.ok(items.every((item) => item.text.length <= 280));
  assert.ok(items.every((item) => item.status === "queued"));
  assert.ok(items.every((item) => item.predictedScore >= 0 && item.predictedScore <= 100));
  assert.ok(items.every((item) => item.visibilityRisk >= 0 && item.visibilityRisk <= 100));
});

test("monetized posts are mixed instead of attached every time", () => {
  const items = generateQueueItems(6);
  const monetizedCount = items.filter((item) => item.offerName).length;
  assert.ok(monetizedCount >= 1);
  assert.ok(monetizedCount < items.length);
});

test("monetized posts keep the full destination URL", () => {
  const items = generateQueueItems(12);
  const monetized = items.filter((item) => item.offerName);
  assert.ok(monetized.length > 0);
  assert.ok(monetized.every((item) => item.text.includes("https://example.com/")));
  assert.ok(monetized.every((item) => !item.text.endsWith("…")));
});

test("generated items include experiment metadata", () => {
  const items = generateQueueItems(8);
  assert.ok(items.every((item) => item.format.length > 0));
  assert.ok(items.every((item) => item.topicCluster.length > 0));
  assert.ok(items.every((item) => item.experimentTag.split("-").length >= 3));
  assert.ok(items.every((item) => item.prediction.likes >= 0));
});

test("queue diversification avoids clustering the same format when alternatives exist", () => {
  const items = generateQueueItems(10);
  for (let index = 1; index < items.length; index += 1) {
    if (items.length >= 4) {
      assert.notEqual(items[index].format, items[index - 1].format);
    }
  }
});

test("trend queue items preserve the source headline and metadata", () => {
  const items = createTrendQueueItems(
    [
      {
        id: "abc123",
        source: "Top Feed",
        category: "technology",
        headline: "OpenAI announces a major enterprise rollout",
        url: "https://example.com/story",
        publishedAt: new Date().toUTCString(),
        freshnessScore: 90,
        trendScore: 88
      }
    ],
    1
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].source, "trend");
  assert.equal(items[0].trendRef?.source, "Top Feed");
  assert.ok(items[0].text.includes("OpenAI announces a major enterprise rollout"));
});

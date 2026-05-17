import type { VercelRequest, VercelResponse } from "@vercel/node";

import { persona, runtime } from "../src/config.js";
import { readPerformance } from "../src/lib/performance-store.js";
import { optimizeQueueOrder, readQueue } from "../src/lib/queue-store.js";
import { readTrends } from "../src/lib/trend-store.js";
import type { QueueItem } from "../src/types.js";

function normalizeQueueItem(item: QueueItem): QueueItem {
  return {
    ...item,
    source: item.source ?? "evergreen",
    topicCluster: item.topicCluster ?? "general",
    predictedScore: item.predictedScore ?? 0,
    visibilityRisk: item.visibilityRisk ?? 0,
    experimentTag: item.experimentTag ?? item.pillar ?? "queue"
  };
}

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const [queue, trends, performance] = await Promise.all([
      readQueue(),
      readTrends(),
      readPerformance()
    ]);

    const orderedQueue = optimizeQueueOrder(queue.map(normalizeQueueItem));
    const queued = orderedQueue.filter((item) => item.status === "queued");
    const posted = orderedQueue.filter((item) => item.status === "posted");
    const queuedTrend = queued.filter((item) => item.source === "trend");
    const queuedEvergreen = queued.filter((item) => item.source === "evergreen");

    res.setHeader("cache-control", "no-store");
    res.status(200).json({
      ok: true,
      updatedAt: new Date().toISOString(),
      brand: {
        name: persona.brandName,
        handle: persona.handle,
        niche: persona.niche,
        audience: persona.audience,
        disclosure: persona.disclosure,
        growthGoal: persona.growthGoal
      },
      runtime: {
        dryRun: runtime.dryRun,
        queueTarget: runtime.queueTarget,
        postsPerRun: runtime.postsPerRun,
        trendPostsPerRun: runtime.trendPostsPerRun,
        trendAutoPost: runtime.trendAutoPost
      },
      summary: {
        queued: queued.length,
        posted: posted.length,
        trends: trends.length,
        performanceRecords: performance.length,
        queuedTrend: queuedTrend.length,
        queuedEvergreen: queuedEvergreen.length
      },
      nextUp: queued.slice(0, 12),
      recentPosted: posted.slice(-6).reverse(),
      topTrends: trends.slice(0, 12)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.setHeader("cache-control", "no-store");
    res.status(500).json({ ok: false, error: message });
  }
}

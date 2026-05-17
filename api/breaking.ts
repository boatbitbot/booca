import type { VercelRequest, VercelResponse } from "@vercel/node";

import { runtime } from "../src/config.js";
import { optimizeQueueOrder, readQueue, writeQueue } from "../src/lib/queue-store.js";
import { fetchTrendStories } from "../src/lib/trend-fetcher.js";
import { createBreakingDrafts, createBreakingQueueItems } from "../src/lib/trend-content.js";

function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\\s+/i, "");
  const querySecret = typeof req.query.secret === "string" ? req.query.secret : undefined;

  return bearer === secret || querySecret === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  try {
    const stories = await fetchTrendStories();
    const drafts = createBreakingDrafts(stories, runtime.breakingStoryLimit);
    const queue = await readQueue();
    const existingIds = new Set(queue.map((item) => item.id));
    const queuedDrafts = createBreakingQueueItems(stories, runtime.breakingStoryLimit)
      .filter((item) => !existingIds.has(item.id))
      .slice(0, runtime.breakingPostsPerRun);
    const nextQueue = optimizeQueueOrder([...queue, ...queuedDrafts]);

    if (queuedDrafts.length > 0) {
      await writeQueue(nextQueue);
    }

    res.setHeader("cache-control", "no-store");
    res.status(200).json({
      ok: true,
      generatedCount: drafts.length,
      queuedCount: queuedDrafts.length,
      stories: stories.slice(0, 10),
      drafts,
      queued: nextQueue.filter((item) => item.status === "queued").slice(0, 20)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.setHeader("cache-control", "no-store");
    res.status(500).json({ ok: false, error: message });
  }
}

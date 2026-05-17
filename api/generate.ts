import type { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchTrends } from "../src/fetch-trends.js";
import { generateQueue } from "../src/generate-queue.js";
import { optimizeQueueOrder, readQueue } from "../src/lib/queue-store.js";

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
    await fetchTrends();
    const generated = await generateQueue();
    const queue = optimizeQueueOrder(await readQueue());
    const queued = queue.filter((item) => item.status === "queued").slice(0, 20);

    res.setHeader("cache-control", "no-store");
    res.status(200).json({
      ok: true,
      generatedCount: generated.length,
      generated,
      queued
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.setHeader("cache-control", "no-store");
    res.status(500).json({ ok: false, error: message });
  }
}

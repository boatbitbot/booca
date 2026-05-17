import type { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchTrendStories } from "../src/lib/trend-fetcher.js";
import { createBreakingDrafts } from "../src/lib/trend-content.js";

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
    const drafts = createBreakingDrafts(stories, 5);

    res.setHeader("cache-control", "no-store");
    res.status(200).json({
      ok: true,
      generatedCount: drafts.length,
      stories: stories.slice(0, 10),
      drafts
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.setHeader("cache-control", "no-store");
    res.status(500).json({ ok: false, error: message });
  }
}

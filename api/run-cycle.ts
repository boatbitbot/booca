import type { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchTrends } from "../src/fetch-trends.js";
import { generateQueue } from "../src/generate-queue.js";
import { postNext } from "../src/post-next.js";

function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
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
    await generateQueue();
    await postNext();
    res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ ok: false, error: message });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { optimizeQueueOrder, readQueue } from "../src/lib/queue-store.js";

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const queue = optimizeQueueOrder(await readQueue());
    res.setHeader("cache-control", "no-store");
    res.status(200).json({ ok: true, queue });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.setHeader("cache-control", "no-store");
    res.status(500).json({ ok: false, error: message });
  }
}

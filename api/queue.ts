import type { VercelRequest, VercelResponse } from "@vercel/node";

import { optimizeQueueOrder, readQueue } from "../src/lib/queue-store.js";

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  const queue = optimizeQueueOrder(await readQueue());
  res.setHeader("cache-control", "no-store");
  res.status(200).json(queue);
}

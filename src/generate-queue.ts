import path from "node:path";
import { pathToFileURL } from "node:url";

import { runtime } from "./config.js";
import { generateQueueItems } from "./lib/content-engine.js";
import { createTrendQueueItems } from "./lib/trend-content.js";
import { optimizeQueueOrder, readQueue, writeQueue } from "./lib/queue-store.js";
import { readTrends } from "./lib/trend-store.js";

export async function generateQueue(): Promise<void> {
  const queue = await readQueue();
  const queuedCount = queue.filter((item) => item.status === "queued").length;
  const toCreate = Math.max(runtime.queueTarget - queuedCount, 0);

  const trends = await readTrends();
  const existingTrendIds = new Set(queue.filter((item) => item.source === "trend").map((item) => item.id));
  const trendQueue = createTrendQueueItems(trends, runtime.trendPostsPerRun, queue.length).filter(
    (item) => !existingTrendIds.has(item.id)
  );
  const trendReserve = trendQueue.length > 0 ? 1 : 0;
  const evergreenSlots = Math.max(toCreate - trendReserve, 0);
  const generated = [...trendQueue, ...generateQueueItems(evergreenSlots, queue.length + trendQueue.length)];

  if (toCreate === 0 && generated.length === 0) {
    console.log(`Queue already has ${queuedCount} queued posts.`);
    return;
  }

  const nextQueue = optimizeQueueOrder([...queue, ...generated]);
  await writeQueue(nextQueue);

  console.log(`Generated ${generated.length} queue items. Total records: ${nextQueue.length}.`);
}

const isEntryPoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntryPoint) {
  generateQueue().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

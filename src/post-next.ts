import path from "node:path";
import { pathToFileURL } from "node:url";

import { runtime } from "./config.js";
import { publishItem } from "./lib/publisher.js";
import { optimizeQueueOrder, readQueue, writeQueue } from "./lib/queue-store.js";

export async function postNext(): Promise<void> {
  const queue = optimizeQueueOrder(await readQueue());
  const trendItems = runtime.trendAutoPost
    ? queue.filter((item) => item.status === "queued" && item.source === "trend").slice(0, runtime.trendPostsPerRun)
    : [];
  const evergreenItems = queue
    .filter((item) => item.status === "queued" && (runtime.trendAutoPost || item.source !== "trend"))
    .slice(0, runtime.postsPerRun);
  const queuedItems = [...trendItems, ...evergreenItems].slice(0, runtime.postsPerRun + runtime.trendPostsPerRun);

  if (queuedItems.length === 0) {
    console.log("No queued posts available.");
    return;
  }

  for (const item of queuedItems) {
    try {
      const result = await publishItem(item);
      item.status = "posted";
      item.postedAt = new Date().toISOString();
      console.log(`${result.dryRun ? "Previewed" : "Posted"} ${item.id}`);
    } catch (error) {
      item.status = "failed";
      console.error(`Failed to publish ${item.id}:`, error);
    }
  }

  await writeQueue(queue);
}

const isEntryPoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntryPoint) {
  postNext().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

import { readPerformance } from "./lib/performance-store.js";
import { readQueue } from "./lib/queue-store.js";

function engagementRate(record: {
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  bookmarks: number;
  linkClicks: number;
  follows: number;
}): number {
  if (record.impressions === 0) return 0;
  const total =
    record.likes +
    record.replies +
    record.reposts +
    record.bookmarks +
    record.linkClicks +
    record.follows;
  return total / record.impressions;
}

async function main(): Promise<void> {
  const [queue, performance] = await Promise.all([readQueue(), readPerformance()]);

  if (performance.length === 0) {
    console.log("No performance records yet. Add data/performance.json entries after posts go live.");
    return;
  }

  const ranked = performance
    .map((record) => {
      const item = queue.find((entry) => entry.id === record.queueId);
      return {
        id: record.queueId,
        experimentTag: item?.experimentTag ?? "unknown",
        predictedScore: item?.predictedScore ?? 0,
        topicCluster: item?.topicCluster ?? "unknown",
        engagementRate: engagementRate(record),
        follows: record.follows,
        linkClicks: record.linkClicks,
        text: item?.text ?? "(missing queue item)"
      };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10);

  for (const item of ranked) {
    console.log(
      `${item.experimentTag} | topic ${item.topicCluster} | ER ${(item.engagementRate * 100).toFixed(2)}% | follows ${item.follows} | clicks ${item.linkClicks} | predicted ${item.predictedScore}`
    );
    console.log(item.text);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import type { QueueItem } from "../types.js";
import { readJsonFile, writeJsonFile } from "./json-store.js";

export async function ensureStore(): Promise<void> {
  return;
}

export async function readQueue(): Promise<QueueItem[]> {
  return readJsonFile<QueueItem[]>("queue.json", []);
}

export async function writeQueue(items: QueueItem[]): Promise<void> {
  await writeJsonFile("queue.json", items);
}

export function getNextQueuedItem(items: QueueItem[]): QueueItem | undefined {
  return items.find((item) => item.status === "queued");
}

export function optimizeQueueOrder(items: QueueItem[]): QueueItem[] {
  const postedOrFailed = items.filter((item) => item.status !== "queued");
  const queued = items
    .filter((item) => item.status === "queued")
    .sort((a, b) => {
      const trendBoost = Number(b.source === "trend") - Number(a.source === "trend");
      if (trendBoost !== 0) {
        return trendBoost;
      }

      const scoreDiff = (b.predictedScore ?? 0) - (a.predictedScore ?? 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (a.visibilityRisk ?? 100) - (b.visibilityRisk ?? 100);
    });

  return [...postedOrFailed, ...queued];
}

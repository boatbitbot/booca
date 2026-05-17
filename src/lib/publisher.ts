import { TwitterApi } from "twitter-api-v2";

import { runtime } from "../config.js";
import type { QueueItem } from "../types.js";

function createClient(): TwitterApi {
  const appKey = process.env.X_APP_KEY;
  const appSecret = process.env.X_APP_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error("Missing X API credentials. Fill in .env before live posting.");
  }

  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret
  });
}

export async function publishItem(item: QueueItem): Promise<{ id: string; dryRun: boolean }> {
  if (runtime.dryRun) {
    console.log(`[dry-run] Would post:\n${item.text}\n`);
    return { id: item.id, dryRun: true };
  }

  const client = createClient();
  const result = await client.v2.tweet(item.text);
  return { id: result.data.id, dryRun: false };
}

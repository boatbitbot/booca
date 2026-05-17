import path from "node:path";
import { pathToFileURL } from "node:url";

import { fetchTrendStories } from "./lib/trend-fetcher.js";
import { writeTrends } from "./lib/trend-store.js";

export async function fetchTrends(): Promise<void> {
  const stories = await fetchTrendStories();
  await writeTrends(stories);
  console.log(`Fetched ${stories.length} trend stories.`);
}

const isEntryPoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntryPoint) {
  fetchTrends().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

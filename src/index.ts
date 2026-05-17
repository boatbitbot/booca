import { fetchTrends } from "./fetch-trends.js";
import { generateQueue } from "./generate-queue.js";
import { postNext } from "./post-next.js";

async function main(): Promise<void> {
  await fetchTrends();
  await generateQueue();
  await postNext();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

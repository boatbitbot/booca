import type { TrendStory } from "../types.js";
import { readJsonFile, writeJsonFile } from "./json-store.js";

export async function readTrends(): Promise<TrendStory[]> {
  return readJsonFile<TrendStory[]>("trends.json", []);
}

export async function writeTrends(stories: TrendStory[]): Promise<void> {
  await writeJsonFile("trends.json", stories);
}

import type { PerformanceRecord } from "../types.js";
import { readJsonFile, writeJsonFile } from "./json-store.js";

export async function readPerformance(): Promise<PerformanceRecord[]> {
  return readJsonFile<PerformanceRecord[]>("performance.json", []);
}

export async function writePerformance(records: PerformanceRecord[]): Promise<void> {
  await writeJsonFile("performance.json", records);
}

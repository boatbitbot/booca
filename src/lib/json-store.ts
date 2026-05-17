import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { list, put } from "@vercel/blob";

const dataDir = path.resolve(process.cwd(), "data");

function localPath(name: string): string {
  return path.join(dataDir, name);
}

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureLocalDir(): Promise<void> {
  await mkdir(dataDir, { recursive: true });
}

async function readFromBlob<T>(name: string, fallback: T): Promise<T> {
  const result = await list({ prefix: `state/${name}`, limit: 5 });
  const blob = result.blobs.find((entry) => entry.pathname === `state/${name}`);

  if (!blob) {
    return fallback;
  }

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed reading blob ${name}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function writeToBlob<T>(name: string, value: T): Promise<void> {
  await put(`state/${name}`, JSON.stringify(value, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

export async function readJsonFile<T>(name: string, fallback: T): Promise<T> {
  if (blobEnabled()) {
    return readFromBlob(name, fallback);
  }

  await ensureLocalDir();

  try {
    const raw = await readFile(localPath(name), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

export async function writeJsonFile<T>(name: string, value: T): Promise<void> {
  if (blobEnabled()) {
    await writeToBlob(name, value);
    return;
  }

  await ensureLocalDir();
  await writeFile(localPath(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

import { promises as fs } from "fs";
import path from "path";
import demoStoreSource from "@/data/demo-store.json";
import type { DemoStore } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "demo-store.local.json");

async function ensureStoreFile() {
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(demoStoreSource, null, 2), "utf8");
  }
}

export async function readDemoStore(): Promise<DemoStore> {
  await ensureStoreFile();
  const file = await fs.readFile(storePath, "utf8");
  return JSON.parse(file) as DemoStore;
}

export async function writeDemoStore(store: DemoStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

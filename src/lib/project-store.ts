import { promises as fs } from "fs";
import path from "path";
import { seedData } from "./seed-data";
import type { ProjectData } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "project.json");
const TMP_PATH = path.join("/tmp", "bath-lane-project.json");

function isServerless() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function writePath() {
  return isServerless() ? TMP_PATH : DATA_PATH;
}

export async function readProject(): Promise<ProjectData> {
  const candidates = isServerless()
    ? [TMP_PATH, DATA_PATH]
    : [DATA_PATH, TMP_PATH];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as ProjectData;
    } catch {
      // try next
    }
  }

  const fresh = structuredClone(seedData);
  await writeProject(fresh).catch(() => undefined);
  return fresh;
}

export async function writeProject(data: ProjectData): Promise<void> {
  const filePath = writePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function resetProject(): Promise<ProjectData> {
  const fresh = structuredClone(seedData);
  await writeProject(fresh).catch(() => undefined);
  return fresh;
}

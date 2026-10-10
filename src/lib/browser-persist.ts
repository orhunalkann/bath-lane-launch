"use client";

import type { ProjectData } from "./types";

const STORAGE_KEY = "bath-lane-project-v1";

export function loadLocalProject(): ProjectData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectData;
  } catch {
    return null;
  }
}

export function saveLocalProject(data: ProjectData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota or private mode — ignore; in-memory state still works.
  }
}

export function clearLocalProject(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

"use client";

import { create } from "zustand";
import {
  clearLocalProject,
  loadLocalProject,
  saveLocalProject,
} from "./browser-persist";
import type {
  Assignee,
  BudgetItem,
  CheckIn,
  EpicId,
  Issue,
  Priority,
  ProjectData,
  ProjectMeta,
  Status,
} from "./types";

type Filters = {
  assignee: Assignee | "all";
  epicId: EpicId | "all";
  query: string;
  onlyMine: boolean;
};

type ProjectStore = {
  data: ProjectData | null;
  loading: boolean;
  error: string | null;
  filters: Filters;
  selectedIssueId: string | null;
  activeView: "board" | "backlog" | "budget" | "timeline" | "checkins";
  hydrate: (data: ProjectData) => void;
  load: () => Promise<void>;
  persist: (next: ProjectData) => Promise<void>;
  setFilters: (partial: Partial<Filters>) => void;
  setView: (view: ProjectStore["activeView"]) => void;
  selectIssue: (id: string | null) => void;
  updateIssue: (id: string, patch: Partial<Issue>) => Promise<void>;
  moveIssue: (id: string, status: Status) => Promise<void>;
  createIssue: (input: {
    title: string;
    description?: string;
    assignee?: Assignee;
    priority?: Priority;
    epicId?: EpicId | null;
    status?: Status;
  }) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  updateBudgetItem: (id: string, patch: Partial<BudgetItem>) => Promise<void>;
  updateMeta: (patch: Partial<ProjectMeta>) => Promise<void>;
  addCheckIn: (input: Omit<CheckIn, "id">) => Promise<void>;
  reset: () => Promise<void>;
};

async function save(data: ProjectData) {
  const res = await fetch("/api/project", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save project");
  return (await res.json()) as ProjectData;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  filters: {
    assignee: "all",
    epicId: "all",
    query: "",
    onlyMine: false,
  },
  selectedIssueId: null,
  activeView: "board",

  hydrate: (data) => {
    const local = loadLocalProject();
    const next = local ?? data;
    set({ data: next, loading: false, error: null });
    if (local) saveLocalProject(local);
  },

  load: async () => {
    set({ loading: true, error: null });
    try {
      const local = loadLocalProject();
      if (local) {
        set({ data: local, loading: false });
        return;
      }
      const res = await fetch("/api/project", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load project");
      const data = (await res.json()) as ProjectData;
      set({ data, loading: false });
      saveLocalProject(data);
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Load failed",
      });
    }
  },

  persist: async (next) => {
    set({ data: next });
    saveLocalProject(next);
    try {
      await save(next);
    } catch {
      // Serverless hosts may not keep a writable project file; localStorage is enough.
    }
  },

  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),

  setView: (activeView) => set({ activeView }),

  selectIssue: (selectedIssueId) => set({ selectedIssueId }),

  updateIssue: async (id, patch) => {
    const { data, persist } = get();
    if (!data) return;
    const issues = data.issues.map((issue) =>
      issue.id === id
        ? { ...issue, ...patch, updatedAt: new Date().toISOString() }
        : issue,
    );
    await persist({ ...data, issues });
  },

  moveIssue: async (id, status) => {
    await get().updateIssue(id, { status });
  },

  createIssue: async (input) => {
    const { data, persist } = get();
    if (!data) return;
    const num = data.nextIssueNumber;
    const now = new Date().toISOString();
    const issue: Issue = {
      id: `issue-${num}`,
      key: `${data.meta.key}-${num}`,
      title: input.title,
      description: input.description ?? "",
      type: "task",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      assignee: input.assignee ?? "unassigned",
      epicId: input.epicId ?? null,
      dueDate: null,
      labels: [],
      week: null,
      createdAt: now,
      updatedAt: now,
    };
    await persist({
      ...data,
      issues: [issue, ...data.issues],
      nextIssueNumber: num + 1,
    });
    set({ selectedIssueId: issue.id });
  },

  deleteIssue: async (id) => {
    const { data, persist } = get();
    if (!data) return;
    await persist({
      ...data,
      issues: data.issues.filter((i) => i.id !== id),
    });
    set({ selectedIssueId: null });
  },

  updateBudgetItem: async (id, patch) => {
    const { data, persist } = get();
    if (!data) return;
    const budget = data.budget.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    await persist({ ...data, budget });
  },

  updateMeta: async (patch) => {
    const { data, persist } = get();
    if (!data) return;
    await persist({ ...data, meta: { ...data.meta, ...patch } });
  },

  addCheckIn: async (input) => {
    const { data, persist } = get();
    if (!data) return;
    const checkIn: CheckIn = {
      ...input,
      id: `checkin-${Date.now()}`,
    };
    await persist({
      ...data,
      checkIns: [checkIn, ...data.checkIns],
    });
  },

  reset: async () => {
    set({ loading: true });
    clearLocalProject();
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) throw new Error("Reset failed");
      const data = (await res.json()) as ProjectData;
      saveLocalProject(data);
      set({ data, loading: false, selectedIssueId: null, error: null });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Reset failed",
      });
    }
  },
}));

export function filterIssues(issues: Issue[], filters: Filters): Issue[] {
  return issues.filter((issue) => {
    if (filters.assignee !== "all" && issue.assignee !== filters.assignee) {
      return false;
    }
    if (filters.epicId !== "all" && issue.epicId !== filters.epicId) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay =
        `${issue.key} ${issue.title} ${issue.description} ${issue.labels.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

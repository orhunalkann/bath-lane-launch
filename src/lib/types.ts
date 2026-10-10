export type Status = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type Priority = "highest" | "high" | "medium" | "low" | "lowest";
export type Assignee = "social" | "technical" | "shared" | "unassigned";
export type IssueType = "epic" | "story" | "task" | "bug" | "decision";

export type EpicId =
  | "decisions"
  | "branding"
  | "sourcing"
  | "legal"
  | "website"
  | "marketing"
  | "launch"
  | "ops";

export interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  type: IssueType;
  status: Status;
  priority: Priority;
  assignee: Assignee;
  epicId: EpicId | null;
  dueDate: string | null;
  labels: string[];
  week: number | null;
  createdAt: string;
  updatedAt: string;
  checklist?: { id: string; text: string; done: boolean }[];
}

export interface BudgetItem {
  id: string;
  label: string;
  owner: Assignee;
  estimate: number;
  actual: number;
  notes: string;
  category: "inventory" | "ops" | "brand" | "growth" | "reserve";
}

export interface CheckIn {
  id: string;
  date: string;
  lastWeek: string;
  thisWeek: string;
  blockers: string;
  spend: string;
  author: Assignee;
}

export interface ProjectMeta {
  name: string;
  key: string;
  tagline: string;
  launchDate: string;
  budgetCap: number;
  positioning: string;
  channels: string[];
  partners: {
    social: string;
    technical: string;
  };
}

export interface ProjectData {
  meta: ProjectMeta;
  issues: Issue[];
  budget: BudgetItem[];
  checkIns: CheckIn[];
  nextIssueNumber: number;
}

export const STATUSES: { id: Status; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];

export const EPICS: {
  id: EpicId;
  name: string;
  color: string;
  description: string;
}[] = [
  {
    id: "decisions",
    name: "Week 1 Decisions",
    color: "#0F766E",
    description: "Roles, positioning, name, ownership",
  },
  {
    id: "branding",
    name: "Branding & AI",
    color: "#B45309",
    description: "Brand kit, labels, AI assets",
  },
  {
    id: "sourcing",
    name: "Sourcing from China",
    color: "#C2410C",
    description: "Suppliers, samples, production, freight",
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    color: "#4F46E5",
    description: "LLC, insurance, claims, labels",
  },
  {
    id: "website",
    name: "Website & Shopify",
    color: "#0369A1",
    description: "Store, waitlist, payments, shipping",
  },
  {
    id: "marketing",
    name: "Audience & Content",
    color: "#BE185D",
    description: "Social, creators, emails",
  },
  {
    id: "launch",
    name: "Launch Week",
    color: "#15803D",
    description: "Go-live, ads, review",
  },
  {
    id: "ops",
    name: "Operations",
    color: "#57534E",
    description: "Inventory, packing, bookkeeping",
  },
];

export const ASSIGNEES: {
  id: Assignee;
  label: string;
  initials: string;
  color: string;
}[] = [
  { id: "social", label: "Social", initials: "SO", color: "#BE185D" },
  { id: "technical", label: "Technical", initials: "TE", color: "#0369A1" },
  { id: "shared", label: "Shared", initials: "SH", color: "#0F766E" },
  { id: "unassigned", label: "Unassigned", initials: "?", color: "#78716C" },
];

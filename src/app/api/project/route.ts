import { NextResponse } from "next/server";
import { readProject, resetProject, writeProject } from "@/lib/project-store";
import type { ProjectData } from "@/lib/types";

export async function GET() {
  const data = await readProject();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as ProjectData;
  await writeProject(body);
  return NextResponse.json(body);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: string };
  if (body.action === "reset") {
    const data = await resetProject();
    return NextResponse.json(data);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

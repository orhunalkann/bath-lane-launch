import { AppShell } from "@/components/app-shell";
import { readProject } from "@/lib/project-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await readProject();
  return <AppShell initialData={initialData} />;
}

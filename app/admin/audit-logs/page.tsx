import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AdminAuditLogsClient } from "./ui";

export default async function AdminAuditLogsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  return (
    <AppShell user={user}>
      <AdminAuditLogsClient />
    </AppShell>
  );
}

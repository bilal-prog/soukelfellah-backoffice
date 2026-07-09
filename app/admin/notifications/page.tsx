import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AdminNotificationsClient } from "./ui";

export default async function AdminNotificationsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  return (
    <AppShell user={user}>
      <AdminNotificationsClient />
    </AppShell>
  );
}

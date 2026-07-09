import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AdminUsersClient } from "./ui";

export default async function AdminUsersPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  return (
    <AppShell user={user}>
      <AdminUsersClient />
    </AppShell>
  );
}

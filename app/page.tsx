import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/api";

export default async function HomePage() {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  redirect("/admin");
}

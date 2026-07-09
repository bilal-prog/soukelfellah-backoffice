export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { logout } from "@/lib/api";

export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/api";

export async function GET() {
  return NextResponse.json(await getAdminStats());
}

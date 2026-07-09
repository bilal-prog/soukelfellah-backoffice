export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json({ user: await getCurrentUser() });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unauthorized";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 401 },
    );
  }
}

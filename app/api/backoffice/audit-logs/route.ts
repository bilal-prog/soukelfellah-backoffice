export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getAuditLogs(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get audit logs";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

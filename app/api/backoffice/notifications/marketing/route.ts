export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendMarketingNotification } from "@/lib/api";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await sendMarketingNotification(await request.json()));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to send marketing notification";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

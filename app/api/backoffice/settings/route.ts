export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await getSettings());
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to fetch settings";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await updateSettings(body));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update settings";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

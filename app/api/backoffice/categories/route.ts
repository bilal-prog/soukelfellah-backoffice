export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCategories } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json({ data: await getCategories() });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get categories";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { activateUser } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json(await activateUser(id));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to activate user";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

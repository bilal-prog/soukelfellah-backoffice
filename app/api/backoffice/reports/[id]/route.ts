export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { updateReportStatus } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    return NextResponse.json(await updateReportStatus(id, status));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update report status";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

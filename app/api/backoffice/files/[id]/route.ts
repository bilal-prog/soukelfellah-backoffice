import { NextResponse } from "next/server";
import { deleteFile } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteFile(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete file";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

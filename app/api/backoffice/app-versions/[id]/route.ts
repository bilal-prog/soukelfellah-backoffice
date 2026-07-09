export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { updateAppVersion, deleteAppVersion } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateAppVersion(id, body));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update app version";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteAppVersion(id));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete app version";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { updateProductType, deleteProductType } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ data: await updateProductType(id, body) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update product type";
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
    await deleteProductType(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete product type";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

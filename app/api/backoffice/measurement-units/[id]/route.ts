export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { updateMeasurementUnit, deleteMeasurementUnit } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ data: await updateMeasurementUnit(id, body) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update measurement unit";
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
    await deleteMeasurementUnit(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete measurement unit";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

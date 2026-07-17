export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMeasurementUnits, createMeasurementUnit } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json({ data: await getMeasurementUnits(params) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get measurement units";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ data: await createMeasurementUnit(body) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create measurement unit";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

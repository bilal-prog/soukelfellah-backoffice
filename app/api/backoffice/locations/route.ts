export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getLocations, createLocation } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getLocations(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get locations";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createLocation(body));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create location";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

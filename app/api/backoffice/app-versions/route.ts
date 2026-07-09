export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAppVersions, createAppVersion } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getAppVersions(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get app versions";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createAppVersion(body));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create app version";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getUsers } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getUsers(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get users";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

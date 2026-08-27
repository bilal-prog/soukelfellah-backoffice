export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requestDeleteAccount } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await requestDeleteAccount(body);
    return NextResponse.json(result);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Impossible d'envoyer la demande de suppression.";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { resetUserPassword } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body || {};

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    return NextResponse.json(await resetUserPassword(id, newPassword));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to reset user password";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

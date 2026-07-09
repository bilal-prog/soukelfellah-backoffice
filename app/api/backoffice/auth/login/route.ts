export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { login, setAuthCookies } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await login(body);
    await setAuthCookies(response);
    return NextResponse.json({ user: response.user });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "رقم الهاتف أو كلمة المرور غير صالحة"; // Invalid phone or password in Darija
    return NextResponse.json(
      { message },
      { status: error.response?.status || 401 },
    );
  }
}

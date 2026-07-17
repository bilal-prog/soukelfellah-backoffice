export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getProductTypes, createProductType } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json({ data: await getProductTypes(params) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get product types";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ data: await createProductType(body) });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create product type";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

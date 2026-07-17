import { NextResponse } from "next/server";
import { uploadFiles } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = await uploadFiles(formData);
    return NextResponse.json(data);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to upload file";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 }
    );
  }
}

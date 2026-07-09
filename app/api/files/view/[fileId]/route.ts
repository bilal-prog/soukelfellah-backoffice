import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/files/view/${fileId}`;

    const response = await axios.get(backendUrl, {
      responseType: "arraybuffer",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const contentType = response.headers["content-type"];
    const contentTypeString = typeof contentType === "string" ? contentType : "image/jpeg";

    return new NextResponse(response.data, {
      headers: {
        "Content-Type": contentTypeString,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error proxying file view:", error.message);
    return new NextResponse("File not found", { status: 404 });
  }
}

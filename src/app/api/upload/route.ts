import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = process.env.GCS_BUCKET || "streetcat-images-489803";

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  // Use a stable name from form data if provided (e.g. recipe name), otherwise fallback
  const stableName = formData.get("name") as string | null;
  const slug = stableName
    ? stableName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "")
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const version = Date.now();
  const filename = `recipes/${slug}-${version}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = bucket.file(filename);

  await blob.save(buffer, {
    contentType: file.type,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

  return NextResponse.json({ url: publicUrl });
}

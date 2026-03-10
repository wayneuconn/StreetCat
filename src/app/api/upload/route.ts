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
  const filename = `recipes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

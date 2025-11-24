// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate filename/extension from File.name if available
        const filename = (file as any).name || "";
        if (!filename.toLowerCase().endsWith(".webp")) {
            return NextResponse.json({ error: "Only .webp files allowed" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:image/webp;base64,${base64}`;

        // Upload to Cloudinary (root folder)
        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: "image",
            format: "webp",
            folder: undefined, // root as requested
        });

        return NextResponse.json({ url: result.secure_url }, { status: 201 });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

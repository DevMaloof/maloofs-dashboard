// /app/api/menu/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// 🧩 Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * PUT — Update a menu item (optionally replace image).
 * Expects JSON body that may include:
 *  - imageUrl: string (new Cloudinary secure_url)
 *  - imagePublicId: string (new Cloudinary public id)
 *  - other fields to update
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        // deconstruct known image fields out
        const { imageUrl, imagePublicId, ...rest } = body || {};

        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: "Request body cannot be empty" }, { status: 400 });
        }

        // find existing item
        const existingItem = await MenuItem.findById(id);
        if (!existingItem) {
            return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        }

        // determine if image was replaced (new public id differs from stored one)
        const existingPublicId = (existingItem as any).imagePublicId as string | undefined;
        const isImageReplaced =
            typeof imagePublicId === "string" &&
            imagePublicId.trim() !== "" &&
            typeof existingPublicId === "string" &&
            existingPublicId.trim() !== "" &&
            imagePublicId !== existingPublicId;

        if (isImageReplaced) {
            try {
                // safe call (we already checked existingPublicId is a non-empty string)
                await cloudinary.uploader.destroy(existingPublicId);
                console.log(`🗑️ Deleted old Cloudinary image: ${existingPublicId}`);
            } catch (cloudErr: any) {
                console.error("⚠️ Cloudinary deletion failed:", cloudErr?.message ?? cloudErr);
                // do not fail the whole request if Cloudinary deletion fails — continue
            }
        }

        // Build update data — prefer provided image fields, otherwise keep existing values
        const updateData: any = {
            ...rest,
        };

        if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
            updateData.imageUrl = imageUrl;
        } else if (existingItem.imageUrl) {
            // keep existing
            updateData.imageUrl = existingItem.imageUrl;
        }

        if (typeof imagePublicId === "string" && imagePublicId.trim() !== "") {
            updateData.imagePublicId = imagePublicId;
        } else if (existingPublicId) {
            updateData.imagePublicId = existingPublicId;
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true }).lean();

        return NextResponse.json(
            { message: "Menu item updated successfully", data: updatedItem },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("❌ Error updating menu item:", err);
        return NextResponse.json(
            { error: "Failed to update menu item", details: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}

/**
 * DELETE — delete menu item and remove image from Cloudinary (if present)
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();
        const { id } = params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const item = await MenuItem.findById(id);
        if (!item) {
            return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        }

        const imagePublicId = (item as any).imagePublicId as string | undefined;

        if (typeof imagePublicId === "string" && imagePublicId.trim() !== "") {
            try {
                await cloudinary.uploader.destroy(imagePublicId);
                console.log(`🗑️ Deleted Cloudinary image: ${imagePublicId}`);
            } catch (cloudErr: any) {
                console.error("⚠️ Cloudinary deletion failed:", cloudErr?.message ?? cloudErr);
                // continue — still attempt to delete DB record
            }
        }

        await MenuItem.findByIdAndDelete(id);
        console.log(`✅ Deleted menu item: ${item.name}`);

        return NextResponse.json(
            { message: "Menu item deleted successfully", deleted: { id, name: item.name } },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("❌ Error deleting menu item:", err);
        return NextResponse.json(
            { error: "Failed to delete menu item", details: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}

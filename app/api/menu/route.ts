// /app/api/menu/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// 🔧 Helper: Upload buffer to Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder: string) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", format: "webp" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
}

// ✅ POST — Add new Menu Item
export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const formData = await req.formData();
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        const price = parseFloat(formData.get("price") as string);
        const availability = formData.get("availability") === "true";
        const description = formData.get("description") as string | undefined;
        const image = formData.get("image") as File | null;

        let imageUrl = "";
        let imagePublicId = "";

        if (image) {
            if (!image.name.endsWith(".webp")) {
                return NextResponse.json({ error: "Only .webp images allowed" }, { status: 400 });
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const uploaded = (await uploadToCloudinary(buffer, "maloofs/menu")) as any;
            imageUrl = uploaded.secure_url;
            imagePublicId = uploaded.public_id;
        }

        const newItem = await MenuItem.create({
            name,
            category,
            price,
            availability,
            description,
            imageUrl,
            imagePublicId, // ✅ stored here
        });

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error("Error creating menu item:", error);
        return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
    }
}

// ✅ PUT — Update Menu Item
export async function PUT(req: Request) {
    try {
        await connectToDatabase();

        const formData = await req.formData();
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        const price = parseFloat(formData.get("price") as string);
        const availability = formData.get("availability") === "true";
        const description = formData.get("description") as string | undefined;
        const image = formData.get("image") as File | null;

        const existingItem = await MenuItem.findById(id);
        if (!existingItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        let imageUrl = existingItem.imageUrl;
        let imagePublicId = existingItem.imagePublicId;

        if (image) {
            if (!image.name.endsWith(".webp")) {
                return NextResponse.json({ error: "Only .webp images allowed" }, { status: 400 });
            }

            // Delete old image
            if (existingItem.imagePublicId) {
                await cloudinary.uploader.destroy(existingItem.imagePublicId);
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const uploaded = (await uploadToCloudinary(buffer, "maloofs/menu")) as any;
            imageUrl = uploaded.secure_url;
            imagePublicId = uploaded.public_id;
        }

        const updated = await MenuItem.findByIdAndUpdate(
            id,
            { name, category, price, availability, description, imageUrl, imagePublicId },
            { new: true }
        );

        return NextResponse.json({ success: true, item: updated });
    } catch (error) {
        console.error("Error updating menu item:", error);
        return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
    }
}

// ✅ GET — Fetch all Menu Items
export async function GET() {
    try {
        await connectToDatabase();
        const items = await MenuItem.find().sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
    }
}

// ✅ DELETE — Remove Menu Item + Cloudinary image
export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { id } = await req.json();

        const item = await MenuItem.findById(id);
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (item.imagePublicId) {
            await cloudinary.uploader.destroy(item.imagePublicId);
        }

        await MenuItem.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
    }
}

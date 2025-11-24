// app/api/staff/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Staff from "@/models/Staff";
import { Types } from "mongoose";

interface StaffDoc {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    image?: string;
}

// GET /api/staff/[id]
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> } // 👈 params is a Promise
) {
    try {
        await connectToDatabase();
        const { id } = await context.params; // 👈 must await

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
        }

        const member = await Staff.findById<StaffDoc>(id).lean();

        if (!member) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        return NextResponse.json(
            {
                id: String(member._id),
                name: member.name,
                email: member.email,
                phone: member.phone,
                status: member.status,
                role: member.role,
                image: member.image || null,
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("Error fetching staff member:", err);
        return NextResponse.json(
            { error: "Failed to fetch staff" },
            { status: 500 }
        );
    }
}

// PUT /api/staff/[id]
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await context.params; // 👈 await here

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
        }

        const body = await req.json();
        const updated = await Staff.findByIdAndUpdate(id, body, { new: true });

        if (!updated) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("Error updating staff member:", err);
        return NextResponse.json(
            { error: "Failed to update staff" },
            { status: 500 }
        );
    }
}

// DELETE /api/staff/[id]
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await context.params; // 👈 await here

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
        }

        const deleted = await Staff.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Staff deleted successfully", id },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error deleting staff member:", err);
        return NextResponse.json(
            { error: "Failed to delete staff" },
            { status: 500 }
        );
    }
}

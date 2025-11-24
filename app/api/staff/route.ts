// app/api/staff/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Staff from "@/models/Staff";

interface StaffDoc {
  _id: any; // ObjectId
  name: string;
  email?: string;
  phone?: string;
  status: string;
  role: string;
  image?: string;
}

// 🔹 Define allowed role keys (backend source of truth)
const roleKeys = ["waiter", "chef", "manager", "cleaner", "director", "other"];

// ✅ GET (grouped staff for public page)
export async function GET() {
  try {
    await connectToDatabase();

    const staff = (await Staff.find().lean()) as unknown as StaffDoc[];

    // Initialize groups with empty arrays for each role
    const grouped: Record<string, any[]> = {};
    roleKeys.forEach((key) => {
      grouped[key] = [];
    });

    // Add an "other" bucket
    grouped.other = [];

    // Place staff into correct group
    staff.forEach((member) => {
      const roleKey = roleKeys.includes(member.role) ? member.role : "other";

      grouped[roleKey].push({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        role: member.role, // keep key internally
        image: member.image || null,
      });
    });

    // Hide "other" if empty
    if (grouped.other.length === 0) {
      delete grouped.other;
    }

    return NextResponse.json(grouped, { status: 200 });
  } catch (err) {
    console.error("Error fetching staff:", err);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// ✅ POST (add new staff)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("📦 Incoming staff data:", body);

    // ✅ Handle custom role
    if (body.role === "other" && body.customRole?.trim()) {
      body.role = body.customRole.trim();
    }

    // ✅ Whitelist only required fields
    const allowedFields = ["name", "email", "phone", "role", "status", "image"];
    const sanitizedBody = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );

    // ✅ Basic validation
    if (!sanitizedBody.name || !sanitizedBody.role || !sanitizedBody.status) {
      return NextResponse.json(
        { error: "Missing required fields: name, role, or status" },
        { status: 400 }
      );
    }

    const staff = await Staff.create(sanitizedBody);

    return NextResponse.json(
      {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        status: staff.status,
        role: staff.role,
        image: staff.image || null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Error creating staff:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create staff" },
      { status: 500 }
    );
  }
}



// app/api/staff/meta/route.ts
import { NextResponse } from "next/server";

// ✅ Define reusable types
interface MetaItem {
    key: string;
    label: string;
}

export async function GET() {
    // ✅ Define roles with backend key + user-facing label
    const roles: MetaItem[] = [
        { key: "waiter", label: "Waiter" },
        { key: "chef", label: "Chef" },
        { key: "manager", label: "Manager" },
        { key: "cleaner", label: "Cleaner" },
        { key: "director", label: "Director" },
        { key: "other", label: "Other" }, // 🔹 fallback bucket
    ];

    // ✅ Define statuses with backend key + user-facing label
    const statuses: MetaItem[] = [
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
        { key: "on-leave", label: "On Leave" },
    ];

    return NextResponse.json({ roles, statuses });
}

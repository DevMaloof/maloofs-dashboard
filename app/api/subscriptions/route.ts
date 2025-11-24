// /app/api/subscriptions/route.ts

import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb"; // connects to CustomerInfo
import SubscriptionSchema from "@/models/Subscription";
// 📋 GET all subscriptions (for dashboard)
export async function GET() {
    try {
        const conn = await connectCustomerDB();
        const SubModel = conn.model("Subscription", SubscriptionSchema); // Bind model to CustomerInfo

        const subs = await SubModel.find({}, "email createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(subs, { status: 200 });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json({ message: "Error fetching subscriptions" }, { status: 500 });
    }
}

// 🗑 DELETE a subscriber by ID
export async function DELETE(req: Request) {
    try {
        const conn = await connectCustomerDB();
        const SubModel = conn.model("Subscription", SubscriptionSchema); // Bind model to CustomerInfo

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: "Missing subscriber ID" }, { status: 400 });
        }

        const deleted = await SubModel.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: "Subscriber not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subscriber deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting subscriber:", error);
        return NextResponse.json({ message: "Error deleting subscriber" }, { status: 500 });
    }
}

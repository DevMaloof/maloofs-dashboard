// /app/api/reservations/summary/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET() {
    try {
        await connectCustomerDB(); // ✅ switched to customer DB

        const total = await Reservation.countDocuments();
        const pending = await Reservation.countDocuments({ reservationStatus: "pending" });
        const completed = await Reservation.countDocuments({ reservationStatus: "confirmed" });

        return NextResponse.json({ total, pending, completed });
    } catch (err) {
        console.error("Error fetching reservation summary:", err);
        return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
    }
}

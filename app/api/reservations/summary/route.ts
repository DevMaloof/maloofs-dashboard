// /app/api/reservations/summary/route.ts - FIXED
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import ReservationFactory from "@/models/Reservation";

export async function GET() {
    try {
        const db = await connectCustomerDB(); // ✅ Get the database connection

        // ✅ Get the model instance from the factory function
        const ReservationModel = ReservationFactory(db);

        const total = await ReservationModel.countDocuments();
        const pending = await ReservationModel.countDocuments({ reservationStatus: "pending" });
        const completed = await ReservationModel.countDocuments({ reservationStatus: "confirmed" });

        return NextResponse.json({ total, pending, completed });
    } catch (err) {
        console.error("Error fetching reservation summary:", err);
        return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
    }
}
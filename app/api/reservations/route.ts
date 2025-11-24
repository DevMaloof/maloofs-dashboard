// /app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Reservation, { IReservation } from "@/models/Reservation";

// Lean type helper
type LeanReservation = Omit<IReservation, 'save' | 'validate' | 'remove'> & { _id: string };

export async function GET() {
    try {
        const db = await connectCustomerDB();
        // Ensure Reservation model is registered on this DB connection
        const ReservationModel = db.models.Reservation || Reservation(db);

        const reservations = await ReservationModel.find()
            .sort({ createdAt: -1 })
            .lean() as LeanReservation[];

        const formatted = reservations.map(r => ({
            id: r._id.toString(),
            name: r.name,
            email: r.email,
            phone: r.phone,
            date: r.date,
            time: r.time,
            guests: r.guests,
            reservationStatus: r.reservationStatus,
            notes: (r as any).notes ?? ""
        }));

        return NextResponse.json({ reservations: formatted }, { status: 200 });
    } catch (err) {
        console.error("Error fetching reservations:", err);
        return NextResponse.json(
            { reservations: [], error: "Failed to fetch reservations" },
            { status: 500 }
        );
    }
}

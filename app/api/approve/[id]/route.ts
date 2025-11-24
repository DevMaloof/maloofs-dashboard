// /app/api/approve/[id]/route.ts - FIXED FOR NEXT.JS 15
import { NextResponse, NextRequest } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import ReservationFactory from "@/models/Reservation";
import { sendReservationApprovedEmail } from "@/lib/email";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // ✅ Next.js 15 uses Promise
) {
    try {
        const { id } = await context.params; // ✅ Await the params promise

        const conn = await connectCustomerDB();
        const Reservation = ReservationFactory(conn);

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return NextResponse.json(
                { success: false, message: "Reservation not found" },
                { status: 404 }
            );
        }

        reservation.reservationStatus = "confirmed";
        await reservation.save();

        await sendReservationApprovedEmail(
            reservation.email,
            reservation.name,
            reservation.date,
            reservation.time
        );

        return NextResponse.json({
            success: true,
            message: "Reservation approved and email sent",
        });
    } catch (error) {
        console.error("Error approving reservation:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
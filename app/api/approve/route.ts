import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import ReservationModel from "@/models/Reservation";
import { sendReservationApprovedEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const conn = await connectCustomerDB();
        const Reservation = ReservationModel(conn);

        const reservation = await Reservation.findById(params.id);

        if (!reservation) {
            return NextResponse.json({ success: false, message: "Reservation not found" }, { status: 404 });
        }

        reservation.reservationStatus = "confirmed"; // 👈 corrected field
        await reservation.save();

        await sendReservationApprovedEmail(
            reservation.email,
            reservation.name,
            reservation.date,
            reservation.time
        );

        return NextResponse.json({ success: true, message: "Reservation approved and email sent" });
    } catch (error) {
        console.error("Error approving reservation:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

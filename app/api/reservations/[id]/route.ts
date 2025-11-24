// /app/api/reservations/[id]/route.ts - FIXED FOR NEXT.JS 15
import { NextResponse, NextRequest } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Reservation, { IReservation } from "@/models/Reservation";
import { Types } from "mongoose";
import { sendReservationEmail } from "@/lib/emails/sendReservationEmail";

// Lean type helper
type LeanReservation = Omit<IReservation, 'save' | 'validate' | 'remove'> & { _id: string };

// Format MongoDB doc → JSON
function formatReservation(reservation: LeanReservation) {
  return {
    id: reservation._id.toString(),
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    reservationStatus: reservation.reservationStatus,
    notes: (reservation as any).notes ?? ""
  };
}

// Rebind Reservation model to customer DB connection
async function getReservationModel() {
  const db = await connectCustomerDB();
  return db.models.Reservation || Reservation(db);
}

// --- GET ---
export async function GET(
  _req: NextRequest, // ✅ Fixed: Use NextRequest
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });

    const ReservationModel = await getReservationModel();
    const reservation = await ReservationModel.findById(id).lean() as LeanReservation | null;

    if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    return NextResponse.json(formatReservation(reservation), { status: 200 });
  } catch (err) {
    console.error("Error fetching reservation:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// --- DELETE ---
export async function DELETE(
  _req: NextRequest, // ✅ Fixed: Use NextRequest
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });

    const ReservationModel = await getReservationModel();
    const deleted = await ReservationModel.findByIdAndDelete(id).lean() as LeanReservation | null;

    if (!deleted) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    return NextResponse.json({ message: "Reservation deleted", reservation: formatReservation(deleted) }, { status: 200 });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
  }
}

// --- PUT ---
export async function PUT(
  req: NextRequest, // ✅ Fixed: Use NextRequest
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });

    const body = await req.json();
    const updateData: Partial<IReservation> = {};

    if (body.reservationStatus) updateData.reservationStatus = body.reservationStatus;

    const ReservationModel = await getReservationModel();
    const updated = await ReservationModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean() as LeanReservation | null;

    if (!updated) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    // Send emails if status changes
    if (updateData.reservationStatus === "confirmed") {
      await sendReservationEmail(updated.email, updated.name, "approved");
    }
    if (updateData.reservationStatus === "cancelled") {
      await sendReservationEmail(updated.email, updated.name, "cancelled");
    }

    return NextResponse.json(formatReservation(updated), { status: 200 });
  } catch (err) {
    console.error("Error updating reservation:", err);
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}
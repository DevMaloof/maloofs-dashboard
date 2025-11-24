// /models/Reservation.ts
import { Schema, Connection } from "mongoose";

export interface IReservation {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: Date;
  time: string;
  reservationStatus: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
}

const ReservationSchema = new Schema<IReservation>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reservationStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Factory pattern for multi-connection setup
export default function ReservationModel(conn: Connection) {
  return conn.models.Reservation || conn.model<IReservation>("Reservation", ReservationSchema);
}

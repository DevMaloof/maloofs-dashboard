// /app/api/reservations/stats/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import ReservationFactory from "@/models/Reservation";

// Returns start (and optionally end) dates for a given range in UTC
function getDateRange(range: string) {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (range) {
        case "today":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
            break;

        case "week":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7));
            end = null;
            break;

        case "month":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate()));
            end = null;
            break;

        case "all":
        default:
            start = null;
            end = null;
            break;
    }

    return { start, end };
}

export async function GET(req: Request) {
    try {
        const db = await connectCustomerDB();
        const ReservationModel = ReservationFactory(db); // ✅ this returns the model

        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "all";
        const { start, end } = getDateRange(range);

        const query: any = {};
        if (start && end) {
            query.createdAt = { $gte: start, $lt: end };
        } else if (start) {
            query.createdAt = { $gte: start };
        }

        const total = await ReservationModel.countDocuments(query);
        const pending = await ReservationModel.countDocuments({ ...query, reservationStatus: "pending" });
        const completed = await ReservationModel.countDocuments({ ...query, reservationStatus: "completed" });

        return NextResponse.json({ total, pending, completed });
    } catch (error: any) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

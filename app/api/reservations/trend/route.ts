// /app/api/reservations/trend/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import ReservationFactory from "@/models/Reservation";

function getDateRange(range: string) {
    const now = new Date();
    let start: Date | null = null;

    switch (range) {
        case "today":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            break;
        case "week":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7));
            break;
        case "month":
            start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate()));
            break;
        case "all":
        default:
            start = null;
            break;
    }

    return start;
}

export async function GET(req: Request) {
    try {
        const db = await connectCustomerDB();
        const ReservationModel = ReservationFactory(db); // ✅ this returns the model


        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "all";
        const start = getDateRange(range);

        const match: any = {};
        if (start) match.createdAt = { $gte: start };

        const groups = await ReservationModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const formatted = groups.map((g: any) => ({ date: g._id, count: g.count }));
        return NextResponse.json(formatted);
    } catch (err) {
        console.error("Trend fetch failed:", err);
        return NextResponse.json([], { status: 500 });
    }
}

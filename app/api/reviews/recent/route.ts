// /app/api/reviews/recent/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
    try {
        await connectToDatabase();

        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("❌ Error fetching recent reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

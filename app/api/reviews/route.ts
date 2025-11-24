// /app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
    await connectToDatabase();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json(reviews);
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const data = await req.json();

        const newReview = await Review.create({
            name: data.name || "Anonymous",
            rating: data.rating,
            comment: data.comment,
            recommend: data.recommend ?? false,
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("❌ Error submitting review:", error);
        return NextResponse.json(
            { error: "Failed to submit review" },
            { status: 500 }
        );
    }
}

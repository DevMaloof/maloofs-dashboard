// /app/reviews/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

type Review = {
    _id: string;
    name?: string;
    rating: number;
    comment: string;
    recommend?: boolean;
    createdAt?: string;
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/reviews");
                if (!res.ok) throw new Error("Failed to fetch reviews");
                const data: Review[] = await res.json();
                setReviews(data);
            } catch (err) {
                console.error("❌ Error fetching reviews:", err);
            }
        };
        fetchReviews();
    }, []);

    // ✅ Filter & sort reviews
    const filteredReviews = useMemo(() => {
        let filtered = reviews.filter(
            (r) =>
                r.name?.toLowerCase().includes(search.toLowerCase()) ||
                r.comment.toLowerCase().includes(search.toLowerCase())
        );

        switch (sortBy) {
            case "newest":
                return filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt ?? "").getTime() -
                        new Date(a.createdAt ?? "").getTime()
                );
            case "oldest":
                return filtered.sort(
                    (a, b) =>
                        new Date(a.createdAt ?? "").getTime() -
                        new Date(b.createdAt ?? "").getTime()
                );
            case "top-rated":
                return filtered.sort((a, b) => b.rating - a.rating);
            default:
                return filtered;
        }
    }, [reviews, search, sortBy]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-semibold text-white text-center md:text-left">
                    Customer Reviews 💬
                </h1>

                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Input
                        placeholder="Search by name or comment"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-white placeholder:text-gray-400 w-full sm:w-64 bg-gray-950 border-gray-800"
                    />

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="text-white bg-gray-950 border-gray-800 w-full sm:w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="top-rated">Top Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Review List */}
            {filteredReviews.length === 0 ? (
                <p className="text-gray-400 text-center py-10 text-sm sm:text-base">
                    No reviews found.
                </p>
            ) : (
                <div
                    className="
                        grid 
                        grid-cols-1 
                        sm:grid-cols-2 
                        lg:grid-cols-3 
                        2xl:grid-cols-4 
                        gap-4 
                        sm:gap-6
                    "
                >
                    {filteredReviews.map((review) => (
                        <Card
                            key={review._id}
                            className="
                                bg-gray-900 
                                border border-gray-800 
                                shadow-md 
                                hover:shadow-lg 
                                hover:border-gray-700 
                                transition-all 
                                duration-200
                            "
                        >
                            <CardContent className="p-5 sm:p-6">
                                {/* ⭐ Rating */}
                                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 sm:w-6 sm:h-6 ${i < review.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-600"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* 💬 Comment */}
                                <p className="text-gray-200 italic mb-3 sm:mb-4 leading-relaxed">
                                    “{review.comment}”
                                </p>

                                {/* 👤 Name */}
                                <div className="text-sm text-gray-400">
                                    — {review.name || "Anonymous"}
                                </div>

                                {/* 👍 Recommended */}
                                {review.recommend && (
                                    <div className="text-green-500 text-sm mt-2">
                                        👍 Recommended
                                    </div>
                                )}

                                {/* 🕓 Date */}
                                {review.createdAt && (
                                    <p className="text-xs text-gray-500 mt-3">
                                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric",
                                        })}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

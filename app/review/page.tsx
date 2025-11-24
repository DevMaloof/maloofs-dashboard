// /app/review/page.tsx

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function ReviewPage() {
    const [rating, setRating] = useState(0);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [recommend, setRecommend] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const isFormValid = rating > 0 && comment.trim().length > 0; // ✅ Basic validation

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return; // extra safety check

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, rating, comment, recommend }),
        });

        if (res.ok) {
            setSubmitted(true);
        }
    };

    if (submitted)
        return (
            <motion.div
                className="flex flex-col items-center justify-center h-screen text-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl text-white font-bold mb-4">🎉 Thank You!</h1>
                <p className="text-white">
                    We really appreciate your feedback and hope to see you again soon!
                </p>
            </motion.div>
        );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6">
            <motion.form
                onSubmit={submitReview}
                className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl text-white font-semibold mb-4 text-center">
                    Rate Your Experience 🍽
                </h1>

                {/* ⭐ Star rating */}
                <div className="flex justify-center gap-2 mb-4 bg-gray-900">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            onClick={() => setRating(star)}
                            className={`w-8 h-8 cursor-pointer transition-all duration-150 ${star <= rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-400 hover:text-yellow-400"
                                }`}
                        />
                    ))}
                </div>

                {/* 🧍 Name */}
                <Input
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4 bg-gray-900 text-white"
                />

                {/* 💬 Comment */}
                <Textarea
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="mb-4 bg-gray-900 text-white"
                />

                {/* 👍 Recommend */}
                <label className="flex items-center gap-2 mb-4 text-white">
                    <input
                        type="checkbox"
                        checked={recommend}
                        onChange={(e) => setRecommend(e.target.checked)}
                        className="border-gray-500"
                    />
                    Would you recommend us to others?
                </label>

                {/* 🚀 Submit button */}
                <Button
                    type="submit"
                    className={`w-full text-lg py-6 font-semibold ${isFormValid
                            ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                    disabled={!isFormValid}
                >
                    Submit Review
                </Button>
            </motion.form>
        </div>
    );
}

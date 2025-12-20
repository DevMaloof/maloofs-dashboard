// /app/review/page.tsx
"use client";

import { useState } from "react";
import { Star, Send, MessageSquare, User, ThumbsUp, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function ReviewSubmissionPage() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [recommend, setRecommend] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const isFormValid = rating > 0 && comment.trim().length > 10;

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please provide a rating and a comment with at least 10 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name || "Anonymous", rating, comment, recommend }),
            });

            if (res.ok) {
                toast.success("Thank you for your feedback! Your review has been submitted.");
                setSubmitted(true);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to submit review. Please try again.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full"
                >
                    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <CardContent className="pt-12 pb-10">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center"
                                >
                                    <ChefHat className="h-10 w-10 text-emerald-400" />
                                </motion.div>

                                <h1 className="text-3xl font-bold text-white mb-3">
                                    Thank You! 🎉
                                </h1>

                                <p className="text-gray-300 text-lg mb-6">
                                    We truly value your feedback. Your review helps us improve and serve you better!
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-6 w-6 ${i < rating ? "fill-amber-400" : ""}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-gray-400">
                                        Your {rating}-star rating has been recorded
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-800">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Come back soon for another great experience!
                                    </p>
                                    <Button
                                        onClick={() => window.location.href = "/"}
                                        variant="outline"
                                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    >
                                        Return to Home
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full"
            >
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <div className="mb-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-amber-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Share Your Experience
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-2">
                                Help us improve by telling us about your visit
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <form onSubmit={submitReview}>
                        <CardContent className="space-y-8">
                            {/* Rating Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300 text-lg">How was your experience?</Label>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={rating}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent"
                                        >
                                            {rating > 0 ? `${rating}.0` : "?"}/5.0
                                        </motion.span>
                                    </AnimatePresence>
                                </div>

                                <div className="flex justify-center gap-2 py-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-2 transition-all duration-200 transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-10 w-10 ${star <= (hoverRating || rating)
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-gray-600"
                                                    } transition-all duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-5 text-xs text-gray-500 text-center">
                                    <span>Poor</span>
                                    <span>Fair</span>
                                    <span>Good</span>
                                    <span>Very Good</span>
                                    <span>Excellent</span>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Your Name (Optional)
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white h-12"
                                />
                            </div>

                            {/* Comment Input */}
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-gray-300 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Your Feedback *
                                </Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Tell us about your experience... What did you enjoy? What could be better?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[120px] bg-gray-800 border-gray-700 text-white"
                                    required
                                />
                                <div className="flex items-center justify-between text-sm">
                                    <span className={`${comment.length < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {comment.length < 10
                                            ? `${10 - comment.length} more characters needed`
                                            : "✓ Good length"}
                                    </span>
                                    <span className="text-gray-500">{comment.length}/500</span>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="rounded-lg bg-gray-800/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/20">
                                            <ThumbsUp className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <Label className="text-white font-medium">Would you recommend us?</Label>
                                            <p className="text-sm text-gray-400">Your recommendation helps others decide</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={recommend}
                                        onCheckedChange={setRecommend}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t border-gray-800 pt-6">
                            <Button
                                type="submit"
                                disabled={!isFormValid || loading}
                                className="w-full h-14 text-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Send className="h-5 w-5" />
                                        Submit Your Review
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        All reviews are verified and help us maintain our quality standards.
                        <br />
                        Thank you for helping us improve! 🙏
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
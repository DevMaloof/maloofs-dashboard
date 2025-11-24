// /app/offers/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function OffersPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOffer = async () => {
        if (!subject || !message) {
            toast.warning("Please fill in both fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/email/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Offer sent to ${data.sent} subscribers! 🎉`);
                setSubject("");
                setMessage("");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to send offer.");
            }
        } catch (err) {
            console.error("Error sending offer:", err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl text-white font-semibold mb-6">Send Offers / Discounts</h1>

            <div className="space-y-4">
                <Input
                    placeholder="Offer Subject"
                    className="text-white"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea
                    placeholder="Type your offer message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="h-40 text-white"
                />

                <Button onClick={handleSendOffer} disabled={loading}>
                    {loading ? "Sending..." : "Send Offer"}
                </Button>
            </div>
        </div>
    );
}

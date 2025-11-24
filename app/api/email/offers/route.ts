// /app/api/email/offers/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { Resend } from "resend"; // ✅ Correct modern import

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    try {
        const { subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
        }

        // 🧩 Connect to DB
        const conn = await connectCustomerDB();

        // 🧠 Convert Schema → Model (since you're keeping Subscription as Schema)
        const SubscriptionModel = conn.model("Subscription", Subscription);

        // 🔍 Fetch all subscribers
        const subscribers = await SubscriptionModel.find();

        if (!subscribers.length) {
            return NextResponse.json({ message: "No subscribers found" });
        }

        // 📨 Send email to each subscriber
        for (const sub of subscribers) {
            await resend.emails.send({
                from: "Maloof’s Restaurant <onboarding@resend.dev>",
                to: sub.email,
                subject,
                html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f7f7f7;border-radius:10px;">
                <div style="text-align:center;background:#101828;color:white;padding:15px;border-radius:10px 10px 0 0;">
                    <h1>Maloof’s Restaurant 🍽️</h1>
                </div>
                <div style="background:#101828;padding:25px;border-radius:0 0 10px 10px;">
                    <h2 style="color:white;">${subject}</h2>
                    <p style="color:white;">${message}</p>
                    <p style="margin-top:30px; color:white;"><strong> You received this email because you subscribed to Maloof’s Restaurant updates.</strong></p>
                </div>
            </div>
        `,
            });
        }

        return NextResponse.json({ message: "Offer emails sent successfully!" });
    } catch (error) {
        console.error("Error sending offer emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

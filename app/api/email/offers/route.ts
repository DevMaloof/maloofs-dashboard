// /app/api/email/offers/route.ts - FIXED
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    try {
        const { subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
        }

        // 🧩 Connect to DB
        const conn = await connectCustomerDB();
        const SubscriptionModel = conn.model("Subscription", Subscription);

        // 🔍 Fetch all subscribers
        const subscribers = await SubscriptionModel.find();
        console.log(`📧 Found ${subscribers.length} subscribers to email`);

        if (!subscribers.length) {
            return NextResponse.json({ message: "No subscribers found" });
        }

        const results = {
            successful: [] as string[],
            failed: [] as { email: string; error: any }[]
        };

        // 📨 Send email to each subscriber with proper error handling and rate limiting
        for (let i = 0; i < subscribers.length; i++) {
            const sub = subscribers[i];

            try {
                console.log(`📤 Sending email to: ${sub.email} (${i + 1}/${subscribers.length})`);

                await resend.emails.send({
                    from: "Maloof's Restaurant <onboarding@resend.dev>",
                    to: sub.email,
                    subject,
                    html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f7f7f7;border-radius:10px;">
                <div style="text-align:center;background:#101828;color:white;padding:15px;border-radius:10px 10px 0 0;">
                    <h1>Maloof's Restaurant 🍽️</h1>
                </div>
                <div style="background:#101828;padding:25px;border-radius:0 0 10px 10px;">
                    <h2 style="color:white;">${subject}</h2>
                    <p style="color:white;">${message}</p>
                    <p style="margin-top:30px; color:white;"><strong> You received this email because you subscribed to Maloof's Restaurant updates.</strong></p>
                </div>
            </div>
        `,
                });

                results.successful.push(sub.email);
                console.log(`✅ Successfully sent to: ${sub.email}`);

                // ⏰ Add delay to avoid rate limiting (Resend limit: 10 emails/second)
                if (i < subscribers.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between emails
                }

            } catch (error: any) {
                console.error(`❌ Failed to send to ${sub.email}:`, error?.message || error);
                results.failed.push({
                    email: sub.email,
                    error: error?.message || 'Unknown error'
                });

                // If it's a rate limit error, wait longer
                if (error?.statusCode === 429) {
                    console.log('⏳ Rate limit hit, waiting 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        console.log(`📊 Email sending completed:
          ✅ Successful: ${results.successful.length}
          ❌ Failed: ${results.failed.length}
        `);

        return NextResponse.json({
            message: `Emails sent! Successful: ${results.successful.length}, Failed: ${results.failed.length}`,
            successful: results.successful,
            failed: results.failed
        });

    } catch (error) {
        console.error("Error sending offer emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
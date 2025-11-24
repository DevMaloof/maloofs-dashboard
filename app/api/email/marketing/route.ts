// /app/api/email/marketing/route.ts
import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { sendMarketingEmail } from "@/lib/emails/sendMarketingEmail";
import SubscriptionSchema from "@/models/Subscription";

export async function POST(req: Request) {
    try {
        const { subject, content } = await req.json();
        if (!subject || !content)
            return NextResponse.json({ message: "Missing subject or content" }, { status: 400 });

        // 📬 Get all subscriber emails
        const conn = await connectCustomerDB();
        const SubscriptionModel = conn.model("Subscription", SubscriptionSchema);
        const subscribers = await SubscriptionModel.find({}, "email").lean();
        const emails = subscribers.map((s: any) => s.email);

        if (!emails.length) {
            return NextResponse.json({ message: "No subscribers found" }, { status: 404 });
        }

        await sendMarketingEmail(emails, subject, content);
        return NextResponse.json({ message: "Emails sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Marketing email error:", error);
        return NextResponse.json({ message: "Failed to send emails" }, { status: 500 });
    }
}

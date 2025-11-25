import { NextResponse } from "next/server";
import { connectCustomerDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import transporter from "@/lib/nodemailer";

// Define TypeScript interface
interface Subscriber {
    email: string;
    name?: string;
    createdAt?: Date;
}

export async function POST(req: Request) {
    try {
        const { subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json(
                { error: "Missing subject or message" },
                { status: 400 }
            );
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

        // Extract all email addresses with proper typing
        const emailList: string[] = subscribers.map((sub: any) =>
            sub.email as string
        );

        try {
            // Send single email with BCC to all recipients (more efficient)
            const mailOptions = {
                from: {
                    name: "Maloof's Restaurant",
                    address: process.env.GMAIL_USER!,
                },
                to: process.env.GMAIL_USER!, // Send to yourself
                bcc: emailList, // All subscribers in BCC
                subject,
                html: `
                    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f7f7f7;border-radius:10px;">
                        <div style="text-align:center;background:#101828;color:white;padding:15px;border-radius:10px 10px 0 0;">
                            <h1>Maloof's Restaurant 🍽️</h1>
                        </div>
                        <div style="background:#101828;padding:25px;border-radius:0 0 10px 10px;">
                            <h2 style="color:white;">${subject}</h2>
                            <p style="color:white;">${message}</p>
                            <p style="margin-top:30px; color:white;">
                                <strong>You received this email because you subscribed to Maloof's Restaurant updates.</strong>
                            </p>
                            <p style="color:#9ca3af; font-size: 12px; text-align: center;">
                                <a href="https://maloofsrestaurant.vercel.app/unsubscribe" style="color: #93c5fd;">Unsubscribe</a>
                            </p>
                        </div>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Bulk email sent to ${emailList.length} subscribers via BCC`);

            return NextResponse.json({
                message: `Email sent successfully to ${emailList.length} subscribers`,
                sentCount: emailList.length
            });

        } catch (error) {
            console.error("❌ Error sending bulk email:", error);
            return NextResponse.json(
                { error: "Failed to send bulk email" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("❌ Error processing offer emails:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
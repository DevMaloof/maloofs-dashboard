import { NextResponse } from "next/server";
import transporter from "@/lib/nodemailer";

export async function POST(req: Request) {
    try {
        const { email, name, date, time, guests } = await req.json();

        // Validate required fields
        if (!email || !name || !date || !time || !guests) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const html = `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f7f7f7;border-radius:10px;">
                <div style="text-align:center;background:#111;color:white;padding:15px;border-radius:10px 10px 0 0;">
                    <h1>Maloof's Restaurant 🍽️</h1>
                </div>
                <div style="background:white;padding:25px;border-radius:0 0 10px 10px;">
                    <h2 style="color:#333;">Reservation Confirmed 🎉</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>We're delighted to let you know that your reservation has been <strong>confirmed</strong>!</p>
                    <div style="background:#fafafa;border:1px solid #ddd;padding:15px;border-radius:8px;margin-top:15px;">
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${time}</p>
                        <p><strong>Guests:</strong> ${guests}</p>
                    </div>
                    <p>We look forward to hosting you at <strong>Maloof's Restaurant</strong>. 🍷</p>
                    <p style="font-size:13px;color:#666;">If you have any questions, simply reply to this email.</p>
                    <p style="margin-top:30px;">Warm regards,<br><strong>The Maloof's Team</strong></p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: {
                name: "Maloof's Restaurant",
                address: process.env.GMAIL_USER!,
            },
            to: email,
            subject: "Your Reservation is Confirmed 🎉",
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Reservation confirmation email sent to: ${email}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Email send error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to send email" },
            { status: 500 }
        );
    }
}
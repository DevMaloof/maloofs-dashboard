// /app/api/email/route.ts
import { NextResponse } from "next/server";
import { sendReservationEmail } from "@/lib/emails/sendReservationEmail";

export async function POST(req: Request) {
    try {
        const { email, name, status } = await req.json();

        if (!email || !name || !status) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const response = await sendReservationEmail(email, name, status);

        if (response.error) {
            console.error("❌ Email sending failed:", response.error);
            return NextResponse.json(
                { message: "Failed to send email", error: response.error },
                { status: 500 }
            );
        }

        console.log("✅ Email sent successfully to:", email);
        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("💥 Unexpected error in reservation email route:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}


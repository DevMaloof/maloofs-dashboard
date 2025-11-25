// /lib/emails/sendReservationEmail.ts
import transporter from "@/lib/nodemailer";

type ReservationStatus = "approved" | "cancelled";

export async function sendReservationEmail(
  to: string,
  name: string,
  status: ReservationStatus
): Promise<{ error?: string }> {
  const subject =
    status === "approved"
      ? "🎉 Your Reservation Has Been Approved!"
      : "❌ Your Reservation Was Cancelled";

  const title =
    status === "approved"
      ? "Reservation Confirmed 🎉"
      : "Reservation Cancelled ❌";
  const message =
    status === "approved"
      ? `We're thrilled to have you dine with us at <b>Maloof's Restaurant</b>. Your reservation has been approved successfully!`
      : `We're sorry to inform you that your reservation at <b>Maloof's Restaurant</b> has been cancelled. You may book again anytime.`;

  const html = `
        <div style="background: #030712; font-family: 'Poppins', Arial, sans-serif; max-width: 520px; margin: 0 auto; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid #e5e5e5;">
            <div style="background: #101828; color: white; text-align: center; padding: 24px;">
                <h1 style="margin: 0; font-size: 24px;">Maloof's Restaurant</h1>
            </div>

            <div style="padding: 24px;">
                <h2 style="color: white; margin-bottom: 12px;">${title}</h2>
                <p style="color: #f9fafb; line-height: 1.6;">Hi <b>${name}</b>,</p>
                <p style="color: #f9fafb; line-height: 1.6;">${message}</p>

                ${status === "approved"
      ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://maloofsrestaurant.vercel.app"
                        style="background-color: #101828; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                        View Reservation
                        </a>
                    </div>`
      : ""
    }

                <p style="color: white; font-size: 13px; text-align: center;">
                    Thank you for choosing <b>Maloof's Restaurant</b>.<br>
                    We look forward to serving you soon!
                </p>
            </div>

            <div style="background: #101828; text-align: center; color: white; font-size: 12px; padding: 12px;">
                &copy; ${new Date().getFullYear()} Maloof's Restaurant. All rights reserved.
            </div>
        </div>
    `;

  try {
    const mailOptions = {
      from: {
        name: "Maloof's Restaurant",
        address: process.env.GMAIL_USER!,
      },
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reservation email sent to ${to}`);
    return {};
  } catch (error: any) {
    console.error("💥 Error sending reservation email:", error);
    return { error: error.message || "Unexpected error" };
  }
}
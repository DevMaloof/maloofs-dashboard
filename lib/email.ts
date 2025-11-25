// /lib/email.ts
import transporter from "./nodemailer";

export async function sendReservationApprovedEmail(to: string, name: string, date: string, time: string) {
  try {
    const mailOptions = {
      from: {
        name: "Maloof's Restaurant",
        address: process.env.GMAIL_USER!,
      },
      to,
      subject: "Your Reservation Has Been Approved 🍽️",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
                    <h2 style="color:#16a34a;">Reservation Confirmed ✅</h2>
                    <p>Hi ${name},</p>
                    <p>We're excited to let you know your reservation for <b>${date}</b> at <b>${time}</b> has been approved!</p>
                    <p>We look forward to serving you.</p>
                    <p>– The Maloof's Team</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reservation approval email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending reservation approval email:", error);
    throw error; // Re-throw to handle in calling function
  }
}

export async function sendPromotionalEmail(to: string, subject: string, message: string) {
  try {
    const mailOptions = {
      from: {
        name: "Maloof's Restaurant",
        address: process.env.GMAIL_USER!,
      },
      to,
      subject,
      html: `
                <div style="font-family: Arial, sans-serif; padding: 16px;">
                    <h2>🎉 ${subject}</h2>
                    <p>${message}</p>
                    <p>Visit us soon at Maloof's Restaurant!</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Promo email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending promotional email:", error);
    throw error;
  }
}
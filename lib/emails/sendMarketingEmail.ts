// /lib/emails/sendMarketingEmail.ts
import transporter from "@/lib/nodemailer";

export async function sendMarketingEmail(to: string[], subject: string, content: string) {
    try {
        const mailOptions = {
            from: {
                name: "Maloof's Restaurant",
                address: process.env.GMAIL_USER!,
            },
            bcc: to, // ✅ hides recipients from each other
            subject,
            html: `
                <div style="font-family:sans-serif; background: #030712; padding: 20px; color: white;">
                    <h2 style="color: white;">${subject}</h2>
                    <p style="color: white;">${content}</p>
                    <hr />
                    <p style="font-size:12px;color: #f9fafb">
                        You received this email because you subscribed to Maloof's Restaurant.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Marketing email sent to ${to.length} recipients`);
    } catch (error) {
        console.error("❌ Error sending marketing email:", error);
        throw error;
    }
}
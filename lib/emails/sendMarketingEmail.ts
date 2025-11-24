// /lib/emails/sendMarketingEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMarketingEmail(to: string[], subject: string, content: string) {
    await resend.emails.send({
        from: "Maloof’s Restaurant <onboarding@resend.dev>",
        bcc: to, // ✅ hides recipients from each other
        subject,
        html: `<div style="font-family:sans-serif; background: #030712">
             <h2 style="color: white;">${subject}</h2>
             <p style="color: white;">${content}</p>
             <hr />
             <p style="font-size:12px;color: #f9fafb">You received this email because you subscribed to Maloof’s Restaurant.</p>
           </div>`,
        to: ""
    });
}

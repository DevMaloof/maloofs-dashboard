// app/staff/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StaffClient from "./StaffClient"; // 👈 we'll move the client logic here

export default async function StaffPage() {
    // 🧠 Lazy-load authOptions at runtime only (no top-level import!)
    const { authOptions } = await import("@/lib/authOptions");
    const session = await getServerSession(authOptions);

    // 🔒 Restrict access
    if (!session) {
        redirect("/login");
    }
    if (session.user.role !== "director") {
        redirect("/");
    }

    // ✅ Render client UI separately (keeps useEffect etc. working)
    return <StaffClient />;
}

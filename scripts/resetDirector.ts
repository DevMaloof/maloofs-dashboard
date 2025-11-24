// scripts/resetDirector.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User"; // ✅ reuse your existing model

const MONGODB_URI = process.env.MONGODB_URI_DASHBOARD as string;
if (!MONGODB_URI) {
    throw new Error("⚠️ Please add MONGODB_URI_DASHBOARD in .env.local");
}

async function resetDirectorPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB:", MONGODB_URI);

        const newPassword = "director1234"; // 👈 change if needed
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Upsert director
        const director = await User.findOneAndUpdate(
            { email: "director@maloofs.com" },
            {
                name: "Maloof Director",
                email: "director@maloofs.com",
                role: "director",
                password: hashedPassword,
            },
            { upsert: true, new: true }
        );

        console.log("✅ Director account is ready:", director.email);
        console.log("ℹ️  Use email: director@maloofs.com");
        console.log("ℹ️  Use password:", newPassword);
    } catch (error: any) {
        console.error("❌ Error resetting director password:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetDirectorPassword();

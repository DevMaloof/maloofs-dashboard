// scripts/check-users.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import User from "../models/User"; // ✅ use your existing User model

const MONGODB_URI = process.env.MONGODB_URI_DASHBOARD as string;
if (!MONGODB_URI) {
    throw new Error("⚠️ Please add MONGODB_URI_DASHBOARD in .env.local");
}

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB:", MONGODB_URI);

        const users = await User.find().lean();

        if (users.length === 0) {
            console.log("⚠️  No users found in database.");
        } else {
            console.log(`ℹ️  Found ${users.length} users:`);
            users.forEach((u) => {
                console.log(
                    `- ${u.email} (${u.role})`
                );
            });
        }
    } catch (error: any) {
        console.error("❌ Error fetching users:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUsers();

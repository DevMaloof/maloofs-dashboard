import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <-- load your env file

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 1. Connect to StaffInfo DB
const MONGODB_URI = process.env.MONGODB_URI_DASHBOARD as string;

if (!MONGODB_URI) {
    throw new Error("⚠️ Please add MONGODB_URI_DASHBOARD in .env.local");
}

// 2. Define Staff Schema
const staffSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ["director", "manager", "employee"], default: "employee" },
    password: String,
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

// 3. Seed Director
async function seedDirector() {
    try {
        await mongoose.connect(MONGODB_URI);

        const hashedPassword = await bcrypt.hash("Director@123", 10); // default password

        const director = new Staff({
            name: "Maloof Director",
            email: "director@maloofs.com",
            role: "director",
            password: hashedPassword,
        });

        await director.save();
        console.log("✅ Director account created successfully");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Error seeding director:", error.message);
        process.exit(1);
    }
}

seedDirector();

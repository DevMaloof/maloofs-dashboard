import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

async function seedUsers() {
    await connectToDatabase();

    const users = [
        {
            name: "Maloof Director",
            email: "director@maloof.com",
            password: await bcrypt.hash("123456", 10),
            role: "director",
        },
        {
            name: "Maloof Employee",
            email: "employee@maloof.com",
            password: await bcrypt.hash("123456", 10),
            role: "employee",
        },
    ];

    for (const user of users) {
        const exists = await User.findOne({ email: user.email });
        if (!exists) {
            await User.create(user);
            console.log(`✅ Created ${user.role}: ${user.email}`);
        } else {
            console.log(`⚠️  ${user.email} already exists`);
        }
    }

    process.exit(0);
}

seedUsers();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://developermaloof:IamRyanGosling@maloofsrestaurant.pbahtdh.mongodb.net/StaffInfo?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
    await mongoose.connect(MONGODB_URI);

    const hash = await bcrypt.hash("123456", 10);

    await User.deleteMany({}); // optional: clear existing users

    await User.create([
        {
            name: "Director",
            email: "director@maloof.com",
            password: hash,
            role: "director",
        },
        {
            name: "Employee",
            email: "employee@maloof.com",
            password: hash,
            role: "employee",
        },
    ]);

    console.log("✅ Users created");
    process.exit();
}

seed();

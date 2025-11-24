// /lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI_DASHBOARD = process.env.MONGODB_URI_DASHBOARD!;
const MONGODB_URI_RESTAURANT = process.env.MONGODB_URI_RESTAURANT!;

if (!MONGODB_URI_DASHBOARD || !MONGODB_URI_RESTAURANT) {
    throw new Error("Missing MongoDB connection strings in .env");
}

// ---------- DASHBOARD DB (uses mongoose global connection) ----------
let cachedDashboard = (global as any).dashboardConn || null;

export async function connectToDatabase() {
    if (cachedDashboard) return cachedDashboard;

    cachedDashboard = await mongoose.connect(MONGODB_URI_DASHBOARD);
    (global as any).dashboardConn = cachedDashboard;

    return cachedDashboard;
}

// ---------- RESTAURANT DB (separate connection!) ----------
let cachedRestaurant = (global as any).restaurantConn || null;

export async function connectCustomerDB() {
    if (cachedRestaurant) return cachedRestaurant;

    cachedRestaurant = await mongoose.createConnection(MONGODB_URI_RESTAURANT).asPromise();
    (global as any).restaurantConn = cachedRestaurant;

    return cachedRestaurant;
}

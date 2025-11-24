import mongoose from "mongoose";

const MONGO_URI = process.env.MDB_CONNECTION_STRING;

const test = async () => {
    await mongoose.connect(MONGO_URI);
    const doc = await mongoose.connection.db
        .collection("reservations")
        .findOne({ _id: new mongoose.Types.ObjectId("69112df4545bd223dec850ea") });

    console.log("Result:", doc);
    await mongoose.disconnect();
};

test().catch(console.error);

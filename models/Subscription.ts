import { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

// ✅ Export only the schema (not the model itself)
export default SubscriptionSchema;

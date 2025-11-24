import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    status?: string;
    image?: string;
    customRole?: string;
}

const StaffSchema = new Schema<IStaff>(
    {
        name: { type: String, required: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        role: { type: String, required: true },
        status: { type: String, default: "active" },
        image: { type: String },
        customRole: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Staff ||
    mongoose.model<IStaff>("Staff", StaffSchema);

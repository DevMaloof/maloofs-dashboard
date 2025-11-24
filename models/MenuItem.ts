import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
    name: string;
    category: "desserts" | "drinks" | "maincourse" | "starters";
    price: number;
    availability: boolean;
    description?: string;
    imageUrl?: string;
    public_id?: string;
    imagePublicId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ["desserts", "drinks", "maincourse", "starters"],
            required: true,
        },
        price: { type: Number, required: true },
        availability: { type: Boolean, default: true },
        description: { type: String },
        imageUrl: { type: String },
        public_id: { type: String },
        imagePublicId: { type: String },
    },
    { timestamps: true }
);

const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;

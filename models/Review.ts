// /models/Review.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    name?: string;
    rating: number;
    comment: string;
    date: Date;
    recommend?: boolean;
}

const ReviewSchema = new Schema<IReview>(
    {
        name: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
        recommend: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Review ||
    mongoose.model<IReview>("Review", ReviewSchema);

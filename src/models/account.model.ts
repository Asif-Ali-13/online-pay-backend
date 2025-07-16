import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

interface IAccount extends Document {
    user_id: ObjectId;
    balance: number;
}

const accountSchema = new Schema<IAccount>({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    balance: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

export const Account: Model<IAccount> = mongoose.model<IAccount>("Account", accountSchema);
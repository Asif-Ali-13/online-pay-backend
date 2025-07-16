import mongoose, { Document, Model, Schema } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IUser extends Document{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    refreshToken: string;
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: [true, "first name is a required field"],
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, "last name is a required field"],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, "email is a required field"],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: [true, "password is a required field"],
        trim: true,
        minLength: 6
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true }); 

userSchema.pre<IUser>("save", async function (next) {
    if(!this.isModified("password")) return next();
    
    const salt = await bcrypt.genSalt(5);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (): string {
    const payload = {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
    }
    
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"];
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
}

userSchema.methods.generateRefreshToken = function (): string {
    const payload = { _id: this._id }
    
    const secret = process.env.REFRESH_TOKEN_SECRET!;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"];
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

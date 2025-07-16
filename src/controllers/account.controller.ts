import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Account } from "../models/account.model";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";


export const viewBalance = asyncHandler(
    async (req: Request, res: Response) => {
        
        const user_id = req.user?._id;
        const account = await Account.findOne({ user_id });

        return res.status(200).json(
            new ApiResponse(200, account?.balance, "Balance fetched Successfully")
        );
    }
);


export const transferMoney = asyncHandler(
    async (req: Request, res: Response) => {

        const session = await mongoose.startSession();
        session.startTransaction();

        const { amount, to, password } = req.body;

        const user = await User.findById(req.user?._id);
        const isMatch = await user?.comparePassword(password);
        if (!isMatch) throw new ApiError(401, "Wrong password");

        const sender = await Account.findOne({ user_id: req.user?._id }).session(session);
        if(!sender || sender.balance < amount){
            await session.abortTransaction();
            throw new ApiError(400, "Insufficient Balance :(");
        }

        const recipient = await Account.findOne({ user_id: to }).session(session);
        if(!recipient){
            await session.abortTransaction();
            throw new ApiError(400, "Recipient account is Invalid");
        }

        await Account.updateOne(
            { user_id: sender.user_id }, { $inc: { balance: -amount }}
        ).session(session);

        await Account.updateOne(
            { user_id: recipient.user_id }, { $inc: { balance: amount }}
        ).session(session);

        await session.commitTransaction();
        return res.status(200).json(new ApiResponse(200, {}, "Money Transfer Successfully !"));
    }
);


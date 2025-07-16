import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Account } from "../models/account.model";
import jwt, { JwtPayload } from "jsonwebtoken";

export const signUpUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new ApiError(400, "User with this email already exists");
        
        const user = new User({ firstName, lastName, email, password });
        await user.save();

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        const cookieOptions = { httpOnly: true, secure: true };

        // creating dummy money for the user, balance : [1, 10000]
        const balance: number = 1 + Math.round(Math.random() * 10000);
        await Account.create({ user_id: user._id, balance: balance });

        res.status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(
                201, 
                { user: { _id: user._id, firstName, lastName, email } }, 
                "Signup successful"
            ));
    }
);

export const signInUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if(!email || !password) throw new ApiError(400, "No email or password provided");
        
        const user = await User.findOne({ email });
        if (!user) throw new ApiError(401, "Invalid email or password");

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new ApiError(401, "Wrong password");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        const cookieOptions = { httpOnly: true, secure: true };

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(
                200, 
                { user: { 
                    _id: user._id, 
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email 
                } }, 
                "Signin successful"
            ));
    }
);


export const updateUser = asyncHandler(
    async(req: Request, res: Response) => {
        
        const allowedUpdates = ["firstName", "lastName", "password"];
        const updates: Partial<Record<string, any>> = {};

        for(const key of allowedUpdates){
            if(req.body[key] !== undefined){
                updates[key] = req.body[key];
            }
        }

        const user = await User.findById(req.user?._id);

        return res.status(200).json(new ApiResponse(
            200, 
            { firstName: user?.firstName, lastName: user?.lastName, email: user?.email }, 
            "Updated Successfully"
        ));
    }
);


export const filterUser = asyncHandler(
    async(req: Request, res: Response) => {

        const filter = req.query.filter || "";
        const user = await User.find({ 
            $or: [ 
                { firstName: { "$regex": filter , "$options": "i" } }, 
                { lastName: { "$regex": filter , "$options": "i" } }]
            });

        return res.status(200).json(new ApiResponse(
            200, 
            { user: 
                user.map(user => ({ 
                    firstName: user.firstName, lastName: user.lastName, 
                    email: user.email, _id: user._id })
                )
            }, 
            "filtered Successfull"));
    }
);

export const logoutUser = asyncHandler(
    async(req: Request, res: Response) => {
        
        const refreshToken = req.cookies?.refreshToken;
        if(!refreshToken) 
            return res.status(200).json(new ApiResponse(200, {}, "Logged Out successfull"));

        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as 
                JwtPayload & { _id?: string; };

            const user = await User.findById(decoded._id);
            if (user) {
                user.refreshToken = "";
                await user.save();
            }
        } catch (err) {}

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(200).json(new ApiResponse(200, {}, "Logged Out successfull"));
    }
);

export const getCurrentUser = asyncHandler(
    async(req: Request, res: Response) => {

        if(!req.user) throw new ApiError(401, "Not Authenticated");
        return res.status(200).json(new ApiResponse(
            200,
            { 
                _id: req.user?._id, 
                firstName: req.user?.firstName, 
                lastName: req.user?.lastName, 
                email: req.user?.email 
            },
            "User fetched Successfully"
        ));
    }
);
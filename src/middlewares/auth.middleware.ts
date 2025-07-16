import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";


declare module "express-serve-static-core"{
    interface Request {
        user?: IUser;
    }
}


export const verifyJWT = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.cookies?.accessToken;
            if(!accessToken) throw new ApiError(400, "Access Token is missing");

            const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
            const decodedToken = jwt.verify(
                accessToken, accessTokenSecret
            ) as JwtPayload & { _id: string };

            if(!decodedToken._id){
                new ApiError(400, "Invalid token payload: missing user ID");
            }

            const user: IUser = 
                await User.findById(decodedToken._id).select("-password -refreshToken");
            if(!user) throw new ApiError(401, "Unauthorised");

            req.user = user;
            next();
        } 
        catch (error) {
            if(error instanceof ApiError && error.statusCode === 400){
                return res.status(400).json(new ApiResponse(400, {}, error.message));
            }

            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                return res.status(401).json(new ApiResponse(401, {}, "Not authenticated"));
            }

            try {
                const user: IUser = 
                    await User.findOne({ refreshToken }).select("-password -refreshToken");
                
                const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
                jwt.verify(refreshToken, refreshTokenSecret);

                const newAccessToken = user.generateAccessToken();
                const newRefreshToken = user.generateRefreshToken();
                const cookieOptions = { httpOnly: true, secure: true };
                res.cookie("accessToken", newAccessToken, cookieOptions);
                res.cookie("refreshToken", newRefreshToken, cookieOptions);
                next();

            } catch (error) {
                return res.status(403).json(
                    new ApiResponse(403, {}, "Invalid or Expired Refresh Token")
                );
            }
        }
    }
);
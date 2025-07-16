"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const ApiResponse_1 = require("../utils/ApiResponse");
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
        if (!accessToken)
            throw new ApiError_1.ApiError(400, "Access Token is missing");
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const decodedToken = jsonwebtoken_1.default.verify(accessToken, accessTokenSecret);
        if (!decodedToken._id) {
            new ApiError_1.ApiError(400, "Invalid token payload: missing user ID");
        }
        const user = yield user_model_1.User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user)
            throw new ApiError_1.ApiError(401, "Unauthorised");
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError && error.statusCode === 400) {
            return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, error.message));
        }
        const refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
        if (!refreshToken) {
            return res.status(401).json(new ApiResponse_1.ApiResponse(401, {}, "Not authenticated"));
        }
        try {
            const user = yield user_model_1.User.findOne({ refreshToken }).select("-password -refreshToken");
            const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
            jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecret);
            const newAccessToken = user.generateAccessToken();
            const newRefreshToken = user.generateRefreshToken();
            const cookieOptions = { httpOnly: true, secure: true };
            res.cookie("accessToken", newAccessToken, cookieOptions);
            res.cookie("refreshToken", newRefreshToken, cookieOptions);
            next();
        }
        catch (error) {
            return res.status(403).json(new ApiResponse_1.ApiResponse(403, {}, "Invalid or Expired Refresh Token"));
        }
    }
}));

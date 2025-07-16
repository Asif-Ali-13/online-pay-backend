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
exports.getCurrentUser = exports.logoutUser = exports.filterUser = exports.updateUser = exports.signInUser = exports.signUpUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const account_model_1 = require("../models/account.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.signUpUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = yield user_model_1.User.findOne({ email });
    if (existingUser)
        throw new ApiError_1.ApiError(400, "User with this email already exists");
    const user = new user_model_1.User({ firstName, lastName, email, password });
    yield user.save();
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    yield user.save();
    const cookieOptions = { httpOnly: true, secure: true };
    // creating dummy money for the user, balance : [1, 10000]
    const balance = 1 + Math.round(Math.random() * 10000);
    yield account_model_1.Account.create({ user_id: user._id, balance: balance });
    res.status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse_1.ApiResponse(201, { user: { _id: user._id, firstName, lastName, email } }, "Signup successful"));
}));
exports.signInUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        throw new ApiError_1.ApiError(400, "No email or password provided");
    const user = yield user_model_1.User.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid email or password");
    const isMatch = yield user.comparePassword(password);
    if (!isMatch)
        throw new ApiError_1.ApiError(401, "Wrong password");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    yield user.save();
    const cookieOptions = { httpOnly: true, secure: true };
    res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse_1.ApiResponse(200, { user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        } }, "Signin successful"));
}));
exports.updateUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const allowedUpdates = ["firstName", "lastName", "password"];
    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }
    const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { firstName: user === null || user === void 0 ? void 0 : user.firstName, lastName: user === null || user === void 0 ? void 0 : user.lastName, email: user === null || user === void 0 ? void 0 : user.email }, "Updated Successfully"));
}));
exports.filterUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query.filter || "";
    const user = yield user_model_1.User.find({
        $or: [
            { firstName: { "$regex": filter, "$options": "i" } },
            { lastName: { "$regex": filter, "$options": "i" } }
        ]
    });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, { user: user.map(user => ({
            firstName: user.firstName, lastName: user.lastName,
            email: user.email, _id: user._id
        }))
    }, "filtered Successfull"));
}));
exports.logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!refreshToken)
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Logged Out successfull"));
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.User.findById(decoded._id);
        if (user) {
            user.refreshToken = "";
            yield user.save();
        }
    }
    catch (err) { }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Logged Out successfull"));
}));
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!req.user)
        throw new ApiError_1.ApiError(401, "Not Authenticated");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        firstName: (_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName,
        lastName: (_c = req.user) === null || _c === void 0 ? void 0 : _c.lastName,
        email: (_d = req.user) === null || _d === void 0 ? void 0 : _d.email
    }, "User fetched Successfully"));
}));

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
exports.transferMoney = exports.viewBalance = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const account_model_1 = require("../models/account.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const user_model_1 = require("../models/user.model");
exports.viewBalance = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const account = yield account_model_1.Account.findOne({ user_id });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, account === null || account === void 0 ? void 0 : account.balance, "Balance fetched Successfully"));
}));
exports.transferMoney = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    const { amount, to, password } = req.body;
    const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    const isMatch = yield (user === null || user === void 0 ? void 0 : user.comparePassword(password));
    if (!isMatch)
        throw new ApiError_1.ApiError(401, "Wrong password");
    const sender = yield account_model_1.Account.findOne({ user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id }).session(session);
    if (!sender || sender.balance < amount) {
        yield session.abortTransaction();
        throw new ApiError_1.ApiError(400, "Insufficient Balance :(");
    }
    const recipient = yield account_model_1.Account.findOne({ user_id: to }).session(session);
    if (!recipient) {
        yield session.abortTransaction();
        throw new ApiError_1.ApiError(400, "Recipient account is Invalid");
    }
    yield account_model_1.Account.updateOne({ user_id: sender.user_id }, { $inc: { balance: -amount } }).session(session);
    yield account_model_1.Account.updateOne({ user_id: recipient.user_id }, { $inc: { balance: amount } }).session(session);
    yield session.commitTransaction();
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Money Transfer Successfully !"));
}));

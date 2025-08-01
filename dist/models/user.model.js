"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
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
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const salt = yield bcrypt_1.default.genSalt(5);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
    };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY;
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
userSchema.methods.generateRefreshToken = function () {
    const payload = { _id: this._id };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRY;
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.User = mongoose_1.default.model("User", userSchema);

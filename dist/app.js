"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "https://o-pay-frontend.vercel.app",
];
// Log every incoming request's method, path, and headers
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    console.log(`[HEADERS]`, req.headers);
    next();
});
app.use((0, cors_1.default)({
    origin: process.env.PROD_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    console.log(`[HEALTHCHECK] backend is up and running !`);
    res.send("Backend is running!");
});
app.use("/api/v1", index_1.default);
exports.default = app;

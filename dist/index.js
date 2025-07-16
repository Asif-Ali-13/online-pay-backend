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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const app_1 = __importDefault(require("./app"));
const index_1 = require("./db/index");
const PORT = process.env.PORT || 8000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, index_1.connectDB)();
        app_1.default.listen(PORT, () => {
            console.log(`Backend is listening on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error(`Error while connecting to DB:`, error);
        process.exit(1);
    }
});
startServer();

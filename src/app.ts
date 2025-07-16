import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index";

const app = express();

const allowedOrigins = [
	"https://o-pay-frontend.vercel.app",
]

// Log every incoming request's method, path, and headers
app.use((req, res, next) => {
	console.log(`[REQUEST] ${req.method} ${req.path}`);
	console.log(`[HEADERS]`, req.headers);
	next();
});


app.use(cors({
  origin: process.env.PROD_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req: Request, res: Response) => {
  console.log(`[HEALTHCHECK] backend is up and running !`);
	res.send("Backend is running!");
});


app.use("/api/v1", router);

export default app;
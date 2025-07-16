import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app";
import { connectDB } from "./db/index";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Error while connecting to DB:`, error);
    process.exit(1);
  }
};


startServer();


import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import seriesRoutes from "./routes/series.routes";
import comicRoutes from "./routes/comic.routes";

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://localhost:27017/infinity-comics";

if (typeof mongoUri !== "string" || mongoUri.length === 0) {
  console.error(
    "Missing MongoDB URI. Set MONGODB_URI in your .env or environment variables."
  );
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/series", seriesRoutes);
app.use("/api/comics", comicRoutes);
app.get("/", (_req, res) => {
  res.send("API Infinity Comics funcionando");
});
export default app;

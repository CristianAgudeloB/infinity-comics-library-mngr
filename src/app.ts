import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import seriesRoutes from "./routes/series.routes";
import comicRoutes from "./routes/comic.routes";
import { errorHandler } from "./middleware/errorHandler";

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
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Manejo de errores de conexión de MongoDB
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

// Rutas
app.use("/api/series", seriesRoutes);
app.use("/api/comics", comicRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API Infinity Comics funcionando",
    version: "1.0.0"
  });
});

// Ruta para health check
app.get("/health", (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    success: true,
    status: "ok",
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores (debe ir al final, después de todas las rutas)
app.use(errorHandler);

export default app;

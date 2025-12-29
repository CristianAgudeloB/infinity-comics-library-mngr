import mongoose from "mongoose";
import dotenv from "dotenv";
import Series from "./src/models/Series";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://localhost:27017/infinity-comics";

async function run() {
  console.log("Conectando a MongoDB...");
  try {
    await mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB");

    console.log("Añadiendo campo 'views' a todas las series...");
    
    // Actualizar todas las series que no tengan el campo views
    const result = await Series.updateMany(
      { views: { $exists: false } },
      { $set: { views: 0 } }
    );

    console.log(`Proceso completado. ${result.modifiedCount} series actualizadas.`);
  } catch (error) {
    console.error("Error durante la ejecución del script:", error);
  } finally {
    mongoose.disconnect();
  }
}

run();


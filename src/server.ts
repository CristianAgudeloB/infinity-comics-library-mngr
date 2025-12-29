import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Manejo de errores no capturados
process.on("unhandledRejection", (reason: Error | any, promise: Promise<any>) => {
  console.error("[UNHANDLED REJECTION]", reason);
  // Cerrar el servidor de forma controlada
  server.close(() => {
    console.log("Server closed due to unhandled rejection");
    process.exit(1);
  });
});

process.on("uncaughtException", (error: Error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
  // Cerrar el servidor de forma controlada
  server.close(() => {
    console.log("Server closed due to uncaught exception");
    process.exit(1);
  });
});

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

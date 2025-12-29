import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface AppError extends Error {
  statusCode?: number;
  code?: string | number;
}

/**
 * Middleware global de manejo de errores
 * Captura todos los errores y los formatea de manera consistente
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log del error para debugging
  console.error("[ERROR]", new Date().toISOString(), err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Errores de Mongoose - CastError (ObjectId inválido)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Valor inválido para el campo '${err.path}': '${err.value}' no es un formato válido`,
      error: "CAST_ERROR",
      field: err.path,
      receivedValue: err.value
    });
  }

  // Errores de Mongoose - ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });

    return res.status(400).json({
      success: false,
      message: "Error de validación",
      error: "VALIDATION_ERROR",
      details: errors
    });
  }

  // Errores de Mongoose - DocumentNotFoundError
  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return res.status(404).json({
      success: false,
      message: "Recurso no encontrado",
      error: "NOT_FOUND"
    });
  }

  // Errores de MongoDB - DuplicateKeyError (MongoServerError con código 11000)
  // Verificar tanto el nombre como el código
  const mongoError = err as any;
  if ((err.name === "MongoServerError" || err.name === "MongoError") && mongoError.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "El recurso ya existe (duplicado)",
      error: "DUPLICATE_KEY_ERROR"
    });
  }

  // Errores con statusCode personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Error en la solicitud",
      error: err.name || "UNKNOWN_ERROR"
    });
  }

  // Error por defecto (500)
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" 
      ? "Error interno del servidor" 
      : err.message || "Error interno del servidor",
    error: "INTERNAL_SERVER_ERROR"
  });
};

/**
 * Wrapper para controladores async que captura errores automáticamente
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


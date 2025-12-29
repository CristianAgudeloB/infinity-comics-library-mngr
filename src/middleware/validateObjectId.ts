import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

/**
 * Middleware para validar que un parámetro sea un ObjectId válido de MongoDB
 */
export const validateObjectId = (paramName: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];

    if (!paramValue) {
      return res.status(400).json({
        success: false,
        message: `Parámetro '${paramName}' es requerido`,
        error: "MISSING_PARAMETER"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(paramValue)) {
      return res.status(400).json({
        success: false,
        message: `El valor '${paramValue}' no es un ObjectId válido para el parámetro '${paramName}'`,
        error: "INVALID_OBJECT_ID",
        receivedValue: paramValue
      });
    }

    next();
  };
};


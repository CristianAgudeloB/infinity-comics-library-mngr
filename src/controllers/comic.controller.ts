import { Request, Response } from "express";
import Comic from "../models/Comic";
import Series from "../models/Series";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/errorHandler";

export const getComics = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const query = Comic.find().sort({ createdAt: -1 });
  
  if (limit) {
    const limitNum = parseInt(limit as string, 10);
    if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
      query.limit(limitNum);
    } else if (limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "El límite máximo es 100",
        error: "VALIDATION_ERROR"
      });
    }
  }
  
  const comics = await query.exec();
  
  res.json(comics);
});

export const getComicById = asyncHandler(async (req: Request, res: Response) => {
  const comic = await Comic.findById(req.params.id);
  
  if (!comic) {
    return res.status(404).json({
      success: false,
      message: "Cómic no encontrado",
      error: "NOT_FOUND"
    });
  }
  
  res.json(comic);
});

export const getComicsBySeries = asyncHandler(async (req: Request, res: Response) => {
  const { seriesId } = req.params;
  
  // Validar que seriesId sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(seriesId)) {
    return res.status(400).json({
      success: false,
      message: `El valor '${seriesId}' no es un ObjectId válido para seriesId`,
      error: "INVALID_OBJECT_ID",
      receivedValue: seriesId
    });
  }
  
  // Verificar que la serie existe
  const series = await Series.findById(seriesId);
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "Serie no encontrada",
      error: "NOT_FOUND"
    });
  }
  
  const comics = await Comic.find({ seriesId }).sort({ createdAt: -1 });
  
  res.json(comics);
});

export const createComic = asyncHandler(async (req: Request, res: Response) => {
  const { title, coverUrl, downloadUrls, pages, seriesId } = req.body;

  // Validación de campos requeridos
  if (!title || !coverUrl || !seriesId) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos requeridos: title, coverUrl, seriesId",
      error: "VALIDATION_ERROR"
    });
  }

  // Validar que downloadUrls sea un array con al menos un elemento
  if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) {
    return res.status(400).json({
      success: false,
      message: "downloadUrls debe ser un array con al menos un elemento",
      error: "VALIDATION_ERROR"
    });
  }

  // Validar que seriesId sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(seriesId)) {
    return res.status(400).json({
      success: false,
      message: `El valor '${seriesId}' no es un ObjectId válido para seriesId`,
      error: "INVALID_OBJECT_ID",
      receivedValue: seriesId
    });
  }

  // Verificar que la serie existe
  const series = await Series.findById(seriesId);
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "La serie especificada no existe",
      error: "NOT_FOUND"
    });
  }

  const comic = await Comic.create({
    title,
    coverUrl,
    downloadUrls,
    pages: pages || [],
    onlineRead: Array.isArray(pages) && pages.length > 0,
    seriesId
  });

  res.status(201).json({
    success: true,
    data: comic,
    message: "Cómic creado exitosamente"
  });
});

export const updateComic = asyncHandler(async (req: Request, res: Response) => {
  // Si se está actualizando seriesId, validar que sea un ObjectId válido
  if (req.body.seriesId && !mongoose.Types.ObjectId.isValid(req.body.seriesId)) {
    return res.status(400).json({
      success: false,
      message: `El valor '${req.body.seriesId}' no es un ObjectId válido para seriesId`,
      error: "INVALID_OBJECT_ID",
      receivedValue: req.body.seriesId
    });
  }

  // Si se está actualizando seriesId, verificar que la serie existe
  if (req.body.seriesId) {
    const series = await Series.findById(req.body.seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: "La serie especificada no existe",
        error: "NOT_FOUND"
      });
    }
  }

  const comic = await Comic.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!comic) {
    return res.status(404).json({
      success: false,
      message: "Cómic no encontrado",
      error: "NOT_FOUND"
    });
  }
  
  res.json({
    success: true,
    data: comic,
    message: "Cómic actualizado exitosamente"
  });
});

export const deleteComic = asyncHandler(async (req: Request, res: Response) => {
  const comic = await Comic.findByIdAndDelete(req.params.id);
  
  if (!comic) {
    return res.status(404).json({
      success: false,
      message: "Cómic no encontrado",
      error: "NOT_FOUND"
    });
  }
  
  res.status(204).send();
});

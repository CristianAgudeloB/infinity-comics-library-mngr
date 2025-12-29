import { Request, Response } from "express";
import Series from "../models/Series";
import Comic from "../models/Comic";
import { asyncHandler } from "../middleware/errorHandler";

export const getSeries = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { publisher } = req.query;
    const filter: any = {};
    
    if (publisher) {
      // Buscar por coincidencia parcial (case-insensitive)
      filter.publisher = { $regex: publisher, $options: "i" };
    }
    
    const series = await Series.find(filter).sort({ createdAt: -1 });
    
    // Añadir información sobre si tienen cómics con lectura online
    const seriesWithOnlineRead = await Promise.all(
      series.map(async (s) => {
        try {
          const hasOnlineComic = await Comic.findOne({
            seriesId: s._id,
            onlineRead: true,
            $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
          });
          
          return {
            ...s.toObject(),
            hasOnlineRead: !!hasOnlineComic
          };
        } catch (error) {
          // Si hay error al buscar cómics, retornar la serie sin el campo
          return {
            ...s.toObject(),
            hasOnlineRead: false
          };
        }
      })
    );
    
    res.json(seriesWithOnlineRead);
  } catch (error) {
    throw error;
  }
});

export const getSeriesById = asyncHandler(async (req: Request, res: Response) => {
  const series = await Series.findById(req.params.id);
  
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "Serie no encontrada",
      error: "NOT_FOUND"
    });
  }
  
  // Verificar si tiene cómics con lectura online
  let hasOnlineComic = false;
  try {
    const onlineComic = await Comic.findOne({
      seriesId: series._id,
      onlineRead: true,
      $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
    });
    hasOnlineComic = !!onlineComic;
  } catch (error) {
    // Si hay error, simplemente usar false
    hasOnlineComic = false;
  }
  
  res.json({
    success: true,
    data: {
      ...series.toObject(),
      hasOnlineRead: hasOnlineComic
    }
  });
});

export const createSeries = asyncHandler(async (req: Request, res: Response) => {
  const { name, publisher, startYear, endYear, coverUrl } = req.body;
  
  // Validación básica
  if (!name || !publisher || !startYear || !coverUrl) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos requeridos: name, publisher, startYear, coverUrl",
      error: "VALIDATION_ERROR"
    });
  }
  
  const series = await Series.create({
    name,
    publisher,
    startYear,
    endYear,
    coverUrl
  });
  
  res.status(201).json({
    success: true,
    data: series,
    message: "Serie creada exitosamente"
  });
});

export const updateSeries = asyncHandler(async (req: Request, res: Response) => {
  const series = await Series.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "Serie no encontrada",
      error: "NOT_FOUND"
    });
  }
  
  res.json({
    success: true,
    data: series,
    message: "Serie actualizada exitosamente"
  });
});

export const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
  const series = await Series.findByIdAndDelete(req.params.id);
  
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "Serie no encontrada",
      error: "NOT_FOUND"
    });
  }
  
  res.status(204).send();
});

export const searchSeries = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "El parámetro de búsqueda 'q' es requerido",
      error: "VALIDATION_ERROR"
    });
  }

  const series = await Series.find({
    name: { $regex: q.trim(), $options: "i" }
  });

  // Añadir información sobre si tienen cómics con lectura online
  const seriesWithOnlineRead = await Promise.all(
    series.map(async (s) => {
      try {
        const hasOnlineComic = await Comic.findOne({
          seriesId: s._id,
          onlineRead: true,
          $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
        });
        
        return {
          ...s.toObject(),
          hasOnlineRead: !!hasOnlineComic
        };
      } catch (error) {
        return {
          ...s.toObject(),
          hasOnlineRead: false
        };
      }
    })
  );
  
  res.json(seriesWithOnlineRead);
});

export const incrementSeriesViews = asyncHandler(async (req: Request, res: Response) => {
  const series = await Series.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  
  if (!series) {
    return res.status(404).json({
      success: false,
      message: "Serie no encontrada",
      error: "NOT_FOUND"
    });
  }
  
  res.json({
    success: true,
    data: series,
    message: "Vistas incrementadas"
  });
});

export const getTopSeries = asyncHandler(async (req: Request, res: Response) => {
  const limitParam = req.query.limit as string;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  
  // Validar que el límite sea un número válido
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: "El parámetro 'limit' debe ser un número entre 1 y 100",
      error: "VALIDATION_ERROR"
    });
  }
  
  const series = await Series.find()
    .sort({ views: -1 })
    .limit(limit);
  
  // Añadir información sobre si tienen cómics con lectura online
  const seriesWithOnlineRead = await Promise.all(
    series.map(async (s) => {
      try {
        const hasOnlineComic = await Comic.findOne({
          seriesId: s._id,
          onlineRead: true,
          $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
        });
        
        return {
          ...s.toObject(),
          hasOnlineRead: !!hasOnlineComic
        };
      } catch (error) {
        return {
          ...s.toObject(),
          hasOnlineRead: false
        };
      }
    })
  );
  
  res.json(seriesWithOnlineRead);
});
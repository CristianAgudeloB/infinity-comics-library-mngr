import { Request, Response } from "express";
import Series from "../models/Series";
import Comic from "../models/Comic";

export const getSeries = async (req: Request, res: Response) => {
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
      const hasOnlineComic = await Comic.findOne({
        seriesId: s._id,
        onlineRead: true,
        $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
      });
      
      return {
        ...s.toObject(),
        hasOnlineRead: !!hasOnlineComic
      };
    })
  );
  
  res.json(seriesWithOnlineRead);
};

export const getSeriesById = async (req: Request, res: Response) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(404).json({ message: "Series not found" });
  
  // Verificar si tiene cómics con lectura online
  const hasOnlineComic = await Comic.findOne({
    seriesId: series._id,
    onlineRead: true,
    $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
  });
  
  res.json({
    ...series.toObject(),
    hasOnlineRead: !!hasOnlineComic
  });
};

export const createSeries = async (req: Request, res: Response) => {
  const series = await Series.create(req.body);
  res.status(201).json(series);
};

export const updateSeries = async (req: Request, res: Response) => {
  const series = await Series.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(series);
};

export const deleteSeries = async (req: Request, res: Response) => {
  await Series.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

export const searchSeries = async (req: Request, res: Response) => {
  const { q } = req.query;

  const series = await Series.find({
    name: { $regex: q, $options: "i" }
  });

  // Añadir información sobre si tienen cómics con lectura online
  const seriesWithOnlineRead = await Promise.all(
    series.map(async (s) => {
      const hasOnlineComic = await Comic.findOne({
        seriesId: s._id,
        onlineRead: true,
        $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
      });
      
      return {
        ...s.toObject(),
        hasOnlineRead: !!hasOnlineComic
      };
    })
  );
  
  res.json(seriesWithOnlineRead);
};

export const incrementSeriesViews = async (req: Request, res: Response) => {
  try {
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!series) return res.status(404).json({ message: "Series not found" });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: "Error incrementing views" });
  }
};

export const getTopSeries = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const series = await Series.find()
    .sort({ views: -1 })
    .limit(limit);
  
  // Añadir información sobre si tienen cómics con lectura online
  const seriesWithOnlineRead = await Promise.all(
    series.map(async (s) => {
      const hasOnlineComic = await Comic.findOne({
        seriesId: s._id,
        onlineRead: true,
        $expr: { $gt: [{ $size: { $ifNull: ["$pages", []] } }, 0] }
      });
      
      return {
        ...s.toObject(),
        hasOnlineRead: !!hasOnlineComic
      };
    })
  );
  
  res.json(seriesWithOnlineRead);
};
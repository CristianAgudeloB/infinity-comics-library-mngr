import { Request, Response } from "express";
import Comic from "../models/Comic";

export const getComics = async (req: Request, res: Response) => {
  const { limit } = req.query;
  const query = Comic.find().sort({ createdAt: -1 });
  
  if (limit) {
    const limitNum = parseInt(limit as string, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      query.limit(limitNum);
    }
  }
  
  const comics = await query.exec();
  res.json(comics);
};

export const getComicById = async (req: Request, res: Response) => {
  const comic = await Comic.findById(req.params.id);
  if (!comic) return res.status(404).json({ message: "Comic not found" });
  res.json(comic);
};

export const getComicsBySeries = async (req: Request, res: Response) => {
  const comics = await Comic.find({ seriesId: req.params.seriesId });
  res.json(comics);
};

export const createComic = async (req: Request, res: Response) => {
  const { title, coverUrl, downloadUrls, pages, seriesId } = req.body;

  const comic = await Comic.create({
    title,
    coverUrl,
    downloadUrls,
    pages: pages || [],
    onlineRead: Array.isArray(pages) && pages.length > 0,
    seriesId
  });

  res.status(201).json(comic);
};

export const updateComic = async (req: Request, res: Response) => {
  const comic = await Comic.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(comic);
};

export const deleteComic = async (req: Request, res: Response) => {
  await Comic.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

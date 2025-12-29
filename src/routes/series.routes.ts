import { Router } from "express";
import {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  searchSeries,
  incrementSeriesViews,
  getTopSeries
} from "../controllers/series.controller";
import { getComicsBySeries } from "../controllers/comic.controller";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

// Rutas que no requieren validación de ObjectId (deben ir antes de las que sí la requieren)
router.get("/search", searchSeries);
router.get("/top", getTopSeries);
router.get("/", getSeries);

// Rutas que requieren validación de ObjectId
router.get("/:id", validateObjectId("id"), getSeriesById);
router.get("/:seriesId/comics", validateObjectId("seriesId"), getComicsBySeries);
router.post("/:id/views", validateObjectId("id"), incrementSeriesViews);
router.put("/:id", validateObjectId("id"), updateSeries);
router.delete("/:id", validateObjectId("id"), deleteSeries);

// Ruta de creación (sin validación de ObjectId)
router.post("/", createSeries);

export default router;

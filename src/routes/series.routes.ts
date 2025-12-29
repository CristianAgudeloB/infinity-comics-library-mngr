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
const router = Router();

router.get("/search", searchSeries);
router.get("/top", getTopSeries);
router.get("/", getSeries);
router.get("/:id", getSeriesById);
router.get("/:seriesId/comics", getComicsBySeries);
router.post("/", createSeries);
router.post("/:id/views", incrementSeriesViews);
router.put("/:id", updateSeries);
router.delete("/:id", deleteSeries);

export default router;

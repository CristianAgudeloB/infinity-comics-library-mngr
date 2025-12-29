import { Router } from "express";
import {
  getComics,
  getComicById,
  createComic,
  updateComic,
  deleteComic
} from "../controllers/comic.controller";

const router = Router();

router.get("/", getComics);
router.get("/:id", getComicById);
router.post("/", createComic);
router.put("/:id", updateComic);
router.delete("/:id", deleteComic);

export default router;

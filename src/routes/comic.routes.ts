import { Router } from "express";
import {
  getComics,
  getComicById,
  createComic,
  updateComic,
  deleteComic
} from "../controllers/comic.controller";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

// Ruta que no requiere validación de ObjectId
router.get("/", getComics);

// Rutas que requieren validación de ObjectId
router.get("/:id", validateObjectId("id"), getComicById);
router.put("/:id", validateObjectId("id"), updateComic);
router.delete("/:id", validateObjectId("id"), deleteComic);

// Ruta de creación (sin validación de ObjectId, pero se valida en el controlador)
router.post("/", createComic);

export default router;

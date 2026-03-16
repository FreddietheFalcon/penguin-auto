import express from "express";
import {
    getAllParts,
    getLowStockParts,
    getPartById,
    createPart,
    updatePart,
    deletePart,
} from "../controllers/partsController.js";

const router = express.Router();

router.get("/", getAllParts);
router.get("/low-stock", getLowStockParts);
router.get("/:id", getPartById);
router.post("/", createPart);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

export default router;

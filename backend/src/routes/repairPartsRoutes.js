import express from "express";
import {
    getPartsForRepair,
    addPartToRepair,
    updateRepairPart,
    removePartFromRepair,
} from "../controllers/repairPartsController.js";

const router = express.Router();

router.get("/:repairId", getPartsForRepair);
router.post("/", addPartToRepair);
router.put("/:repairId/:partId", updateRepairPart);
router.delete("/:repairId/:partId", removePartFromRepair);

export default router;

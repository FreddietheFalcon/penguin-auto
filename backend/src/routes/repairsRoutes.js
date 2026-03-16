import express from "express";
import {
    getAllRepairs,
    getRepairsByStatus,
    getRepairById,
    createRepair,
    updateRepair,
    assignTechnician,
    deleteRepair,
} from "../controllers/repairsController.js";

const router = express.Router();

router.get("/", getAllRepairs);
router.get("/status/:status", getRepairsByStatus);
router.get("/:id", getRepairById);
router.post("/", createRepair);
router.put("/:id", updateRepair);
router.patch("/:id/assign", assignTechnician);
router.delete("/:id", deleteRepair);

export default router;

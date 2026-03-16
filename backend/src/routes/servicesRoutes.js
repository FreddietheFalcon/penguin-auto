import express from "express";
import {
    getAllServices,
    getActiveServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from "../controllers/servicesController.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/active", getActiveServices);
router.get("/:id", getServiceById);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;

import express from "express";
import {
    getAllVehicles,
    getVehicleById,
    getVehiclesByCustomer,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} from "../controllers/vehiclesController.js";

const router = express.Router();

router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.get("/customer/:customerId", getVehiclesByCustomer);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;

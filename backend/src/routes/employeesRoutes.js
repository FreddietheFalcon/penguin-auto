import express from "express";
import {
    getAllEmployees,
    getActiveEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "../controllers/employeesController.js";

const router = express.Router();

router.get("/", getAllEmployees);
router.get("/active", getActiveEmployees);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;

import express from "express";
import {
    getAllTransactions,
    getTransactionById,
    getTransactionsByRepair,
    createTransaction,
    updateTransactionStatus,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.get("/repair/:repairId", getTransactionsByRepair);
router.post("/", createTransaction);
router.patch("/:id/status", updateTransactionStatus);

export default router;

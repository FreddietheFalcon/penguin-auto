import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import customersRoutes from "./routes/customersRoutes.js";
import vehiclesRoutes from "./routes/vehiclesRoutes.js";
import employeesRoutes from "./routes/employeesRoutes.js";
import partsRoutes from "./routes/partsRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import repairsRoutes from "./routes/repairsRoutes.js";
import repairPartsRoutes from "./routes/repairPartsRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Reliable __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// frontend is at: backend/src/server.js -> ../../.. -> penguin-auto -> ../frontend
// backend/src -> backend -> penguin-auto -> frontend
const FRONTEND_PATH = path.join(__dirname, "..", "..", "frontend");

// --- CORS ---
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://localhost:5001",
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith(".railway.app")) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json());
app.use(rateLimiter);

// --- API Routes ---
app.use("/api/customers",    customersRoutes);
app.use("/api/vehicles",     vehiclesRoutes);
app.use("/api/employees",    employeesRoutes);
app.use("/api/parts",        partsRoutes);
app.use("/api/services",     servicesRoutes);
app.use("/api/repairs",      repairsRoutes);
app.use("/api/repair-parts", repairPartsRoutes);
app.use("/api/transactions", transactionsRoutes);

// --- Serve HTML frontend ---
app.use(express.static(FRONTEND_PATH));

// Fallback for unmatched routes
app.get("*", (req, res) => {
    const indexPath = path.join(FRONTEND_PATH, "index.html");
    res.sendFile(indexPath, err => {
        if (err) res.status(404).send("Page not found. Make sure index.html exists in the frontend folder.");
    });
});

// --- Start server ---
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Penguin Auto server running on port: ${PORT}`);
        console.log(`Frontend path: ${FRONTEND_PATH}`);
    });
});

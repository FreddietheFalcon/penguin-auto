import pool from "../config/db.js";

// GET all vehicles (with customer name joined)
export async function getAllVehicles(_, res) {
    try {
        const [rows] = await pool.query(
            `SELECT v.*, CONCAT(c.first_name, ' ', c.last_name) AS customer_name
             FROM vehicles v
             JOIN customers c ON v.customer_id = c.customer_id
             ORDER BY v.created_at DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllVehicles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET vehicle by ID
export async function getVehicleById(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT v.*, CONCAT(c.first_name, ' ', c.last_name) AS customer_name
             FROM vehicles v
             JOIN customers c ON v.customer_id = c.customer_id
             WHERE v.vehicle_id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error in getVehicleById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET all vehicles for a specific customer
export async function getVehiclesByCustomer(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC",
            [req.params.customerId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getVehiclesByCustomer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create vehicle
export async function createVehicle(req, res) {
    try {
        const { customer_id, make, model, year, color, license_plate, vin_number } = req.body;

        const [result] = await pool.query(
            `INSERT INTO vehicles (customer_id, make, model, year, color, license_plate, vin_number)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [customer_id, make, model, year, color, license_plate, vin_number]
        );

        const [newVehicle] = await pool.query(
            "SELECT * FROM vehicles WHERE vehicle_id = ?",
            [result.insertId]
        );
        res.status(201).json(newVehicle[0]);
    } catch (error) {
        console.error("Error in createVehicle:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "VIN or license plate already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update vehicle
export async function updateVehicle(req, res) {
    try {
        const { customer_id, make, model, year, color, license_plate, vin_number } = req.body;

        const [result] = await pool.query(
            `UPDATE vehicles SET
                customer_id = ?, make = ?, model = ?, year = ?,
                color = ?, license_plate = ?, vin_number = ?
             WHERE vehicle_id = ?`,
            [customer_id, make, model, year, color, license_plate, vin_number, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM vehicles WHERE vehicle_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateVehicle:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE vehicle
export async function deleteVehicle(req, res) {
    try {
        const [result] = await pool.query(
            "DELETE FROM vehicles WHERE vehicle_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error("Error in deleteVehicle:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

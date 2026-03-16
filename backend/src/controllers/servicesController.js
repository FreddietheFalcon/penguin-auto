import pool from "../config/db.js";

// GET all services
export async function getAllServices(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM services ORDER BY service_name ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllServices:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET active services only (for scheduling)
export async function getActiveServices(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM services WHERE is_active = 1 ORDER BY service_name ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getActiveServices:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET service by ID
export async function getServiceById(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM services WHERE service_id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error in getServiceById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create service
export async function createService(req, res) {
    try {
        const { service_name, service_description, hourly_rate, estimated_hours } = req.body;

        const [result] = await pool.query(
            `INSERT INTO services (service_name, service_description, hourly_rate, estimated_hours)
             VALUES (?, ?, ?, ?)`,
            [service_name, service_description, hourly_rate, estimated_hours ?? null]
        );

        const [newService] = await pool.query(
            "SELECT * FROM services WHERE service_id = ?",
            [result.insertId]
        );
        res.status(201).json(newService[0]);
    } catch (error) {
        console.error("Error in createService:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update service
export async function updateService(req, res) {
    try {
        const { service_name, service_description, hourly_rate, estimated_hours, is_active } = req.body;

        const [result] = await pool.query(
            `UPDATE services SET
                service_name = ?, service_description = ?,
                hourly_rate = ?, estimated_hours = ?, is_active = ?
             WHERE service_id = ?`,
            [service_name, service_description, hourly_rate, estimated_hours, is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM services WHERE service_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateService:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE (soft delete — sets is_active = 0)
export async function deleteService(req, res) {
    try {
        const [result] = await pool.query(
            "UPDATE services SET is_active = 0 WHERE service_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ message: "Service deactivated successfully" });
    } catch (error) {
        console.error("Error in deleteService:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

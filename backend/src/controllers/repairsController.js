import pool from "../config/db.js";

// Full repair detail query with all joined info
const REPAIR_DETAIL_QUERY = `
    SELECT
        r.*,
        v.make, v.model, v.year, v.color, v.vin_number, v.license_plate,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email_address AS customer_email,
        c.phone_number AS customer_phone,
        CONCAT(e.first_name, ' ', e.last_name) AS technician_name,
        s.service_name, s.hourly_rate, s.estimated_hours
    FROM repairs r
    JOIN vehicles v ON r.vehicle_id = v.vehicle_id
    JOIN customers c ON v.customer_id = c.customer_id
    LEFT JOIN employees e ON r.employee_id = e.employee_id
    JOIN services s ON r.service_id = s.service_id
`;

// GET all repairs
export async function getAllRepairs(_, res) {
    try {
        const [rows] = await pool.query(
            REPAIR_DETAIL_QUERY + " ORDER BY r.scheduled_date DESC, r.scheduled_time DESC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllRepairs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET repairs filtered by status
export async function getRepairsByStatus(req, res) {
    try {
        const [rows] = await pool.query(
            REPAIR_DETAIL_QUERY + " WHERE r.status = ? ORDER BY r.scheduled_date ASC",
            [req.params.status]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getRepairsByStatus:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET single repair by ID
export async function getRepairById(req, res) {
    try {
        const [rows] = await pool.query(
            REPAIR_DETAIL_QUERY + " WHERE r.repair_id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Repair not found" });
        }

        // Also get parts used in this repair
        const [parts] = await pool.query(
            `SELECT rp.*, p.part_name, p.part_number, p.vendor_name
             FROM repair_parts rp
             JOIN parts p ON rp.part_id = p.part_id
             WHERE rp.repair_id = ?`,
            [req.params.id]
        );

        res.status(200).json({ ...rows[0], parts });
    } catch (error) {
        console.error("Error in getRepairById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create repair (customer scheduling a repair)
export async function createRepair(req, res) {
    try {
        const {
            vehicle_id, employee_id, service_id,
            scheduled_date, scheduled_time, notes,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO repairs
             (vehicle_id, employee_id, service_id, scheduled_date, scheduled_time, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [vehicle_id, employee_id ?? null, service_id, scheduled_date, scheduled_time, notes ?? null]
        );

        const [newRepair] = await pool.query(
            REPAIR_DETAIL_QUERY + " WHERE r.repair_id = ?",
            [result.insertId]
        );
        res.status(201).json(newRepair[0]);
    } catch (error) {
        console.error("Error in createRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update repair (owner assigns tech, updates status, etc.)
export async function updateRepair(req, res) {
    try {
        const {
            vehicle_id, employee_id, service_id, scheduled_date,
            scheduled_time, status, completion_date, notes, labor_hours,
        } = req.body;

        const [result] = await pool.query(
            `UPDATE repairs SET
                vehicle_id = ?, employee_id = ?, service_id = ?,
                scheduled_date = ?, scheduled_time = ?, status = ?,
                completion_date = ?, notes = ?, labor_hours = ?
             WHERE repair_id = ?`,
            [vehicle_id, employee_id ?? null, service_id, scheduled_date,
             scheduled_time, status, completion_date ?? null, notes ?? null,
             labor_hours ?? null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Repair not found" });
        }

        const [updated] = await pool.query(
            REPAIR_DETAIL_QUERY + " WHERE r.repair_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PATCH assign technician only
export async function assignTechnician(req, res) {
    try {
        const { employee_id } = req.body;

        const [result] = await pool.query(
            "UPDATE repairs SET employee_id = ?, status = 'In Progress' WHERE repair_id = ?",
            [employee_id, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Repair not found" });
        }

        const [updated] = await pool.query(
            REPAIR_DETAIL_QUERY + " WHERE r.repair_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in assignTechnician:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE repair
export async function deleteRepair(req, res) {
    try {
        const [result] = await pool.query(
            "DELETE FROM repairs WHERE repair_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Repair not found" });
        }
        res.status(200).json({ message: "Repair deleted successfully" });
    } catch (error) {
        console.error("Error in deleteRepair:", error);
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ message: "Cannot delete repair — a transaction exists for it" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

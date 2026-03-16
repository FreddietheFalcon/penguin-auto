import pool from "../config/db.js";

// GET all parts
export async function getAllParts(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM parts ORDER BY part_name ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllParts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET parts that are low on stock (at or below reorder threshold)
export async function getLowStockParts(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM parts WHERE quantity_on_hand <= reorder_threshold ORDER BY quantity_on_hand ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getLowStockParts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET part by ID
export async function getPartById(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM parts WHERE part_id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Part not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error in getPartById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create part
export async function createPart(req, res) {
    try {
        const {
            part_name, part_number, vendor_name, vendor_contact,
            unit_cost, quantity_on_hand, reorder_threshold,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO parts
             (part_name, part_number, vendor_name, vendor_contact,
              unit_cost, quantity_on_hand, reorder_threshold)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [part_name, part_number, vendor_name, vendor_contact,
             unit_cost, quantity_on_hand ?? 0, reorder_threshold ?? 5]
        );

        const [newPart] = await pool.query(
            "SELECT * FROM parts WHERE part_id = ?",
            [result.insertId]
        );
        res.status(201).json(newPart[0]);
    } catch (error) {
        console.error("Error in createPart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update part
export async function updatePart(req, res) {
    try {
        const {
            part_name, part_number, vendor_name, vendor_contact,
            unit_cost, quantity_on_hand, reorder_threshold,
        } = req.body;

        const [result] = await pool.query(
            `UPDATE parts SET
                part_name = ?, part_number = ?, vendor_name = ?, vendor_contact = ?,
                unit_cost = ?, quantity_on_hand = ?, reorder_threshold = ?
             WHERE part_id = ?`,
            [part_name, part_number, vendor_name, vendor_contact,
             unit_cost, quantity_on_hand, reorder_threshold, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Part not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM parts WHERE part_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updatePart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE part
export async function deletePart(req, res) {
    try {
        const [result] = await pool.query(
            "DELETE FROM parts WHERE part_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Part not found" });
        }
        res.status(200).json({ message: "Part deleted successfully" });
    } catch (error) {
        console.error("Error in deletePart:", error);
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ message: "Cannot delete part — it is used in existing repairs" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

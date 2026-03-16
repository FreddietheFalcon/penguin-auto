import pool from "../config/db.js";

// GET all parts for a repair
export async function getPartsForRepair(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT rp.*, p.part_name, p.part_number, p.vendor_name
             FROM repair_parts rp
             JOIN parts p ON rp.part_id = p.part_id
             WHERE rp.repair_id = ?`,
            [req.params.repairId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getPartsForRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST add a part to a repair
export async function addPartToRepair(req, res) {
    try {
        const { repair_id, part_id, quantity_used, unit_cost_at_time } = req.body;

        // Lock in the current part cost if not provided
        let costToUse = unit_cost_at_time;
        if (!costToUse) {
            const [partRows] = await pool.query(
                "SELECT unit_cost FROM parts WHERE part_id = ?",
                [part_id]
            );
            if (partRows.length === 0) {
                return res.status(404).json({ message: "Part not found" });
            }
            costToUse = partRows[0].unit_cost;
        }

        await pool.query(
            `INSERT INTO repair_parts (repair_id, part_id, quantity_used, unit_cost_at_time)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity_used = ?, unit_cost_at_time = ?`,
            [repair_id, part_id, quantity_used ?? 1, costToUse, quantity_used ?? 1, costToUse]
        );

        // Deduct from inventory
        await pool.query(
            "UPDATE parts SET quantity_on_hand = quantity_on_hand - ? WHERE part_id = ?",
            [quantity_used ?? 1, part_id]
        );

        const [updated] = await pool.query(
            `SELECT rp.*, p.part_name, p.part_number
             FROM repair_parts rp
             JOIN parts p ON rp.part_id = p.part_id
             WHERE rp.repair_id = ? AND rp.part_id = ?`,
            [repair_id, part_id]
        );
        res.status(201).json(updated[0]);
    } catch (error) {
        console.error("Error in addPartToRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update quantity of a part on a repair
export async function updateRepairPart(req, res) {
    try {
        const { repairId, partId } = req.params;
        const { quantity_used } = req.body;

        const [result] = await pool.query(
            "UPDATE repair_parts SET quantity_used = ? WHERE repair_id = ? AND part_id = ?",
            [quantity_used, repairId, partId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Repair part record not found" });
        }

        res.status(200).json({ message: "Quantity updated", repair_id: repairId, part_id: partId, quantity_used });
    } catch (error) {
        console.error("Error in updateRepairPart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE remove a part from a repair
export async function removePartFromRepair(req, res) {
    try {
        const { repairId, partId } = req.params;

        const [result] = await pool.query(
            "DELETE FROM repair_parts WHERE repair_id = ? AND part_id = ?",
            [repairId, partId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Repair part record not found" });
        }
        res.status(200).json({ message: "Part removed from repair" });
    } catch (error) {
        console.error("Error in removePartFromRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

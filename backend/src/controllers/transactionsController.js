import pool from "../config/db.js";

// Generate a unique invoice number
function generateInvoiceNumber() {
    const date = new Date();
    const timestamp = date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, "0") +
        String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${timestamp}-${random}`;
}

// GET all transactions (with repair + customer info)
export async function getAllTransactions(_, res) {
    try {
        const [rows] = await pool.query(
            `SELECT t.*,
                CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                c.email_address AS customer_email,
                v.make, v.model, v.year,
                s.service_name
             FROM transactions t
             JOIN repairs r ON t.repair_id = r.repair_id
             JOIN vehicles v ON r.vehicle_id = v.vehicle_id
             JOIN customers c ON v.customer_id = c.customer_id
             JOIN services s ON r.service_id = s.service_id
             ORDER BY t.transaction_date DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllTransactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET transaction by ID
export async function getTransactionById(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT t.*,
                CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                c.email_address AS customer_email,
                c.phone_number AS customer_phone,
                v.make, v.model, v.year, v.license_plate,
                s.service_name, s.hourly_rate,
                r.labor_hours, r.scheduled_date, r.completion_date,
                CONCAT(e.first_name, ' ', e.last_name) AS technician_name
             FROM transactions t
             JOIN repairs r ON t.repair_id = r.repair_id
             JOIN vehicles v ON r.vehicle_id = v.vehicle_id
             JOIN customers c ON v.customer_id = c.customer_id
             JOIN services s ON r.service_id = s.service_id
             LEFT JOIN employees e ON r.employee_id = e.employee_id
             WHERE t.transaction_id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Get parts used in this repair for the invoice
        const [parts] = await pool.query(
            `SELECT rp.quantity_used, rp.unit_cost_at_time,
                    p.part_name, p.part_number,
                    (rp.quantity_used * rp.unit_cost_at_time) AS line_total
             FROM repair_parts rp
             JOIN parts p ON rp.part_id = p.part_id
             WHERE rp.repair_id = ?`,
            [rows[0].repair_id]
        );

        res.status(200).json({ ...rows[0], parts });
    } catch (error) {
        console.error("Error in getTransactionById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET transactions for a specific repair
export async function getTransactionsByRepair(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM transactions WHERE repair_id = ? ORDER BY transaction_date DESC",
            [req.params.repairId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getTransactionsByRepair:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create transaction / invoice
export async function createTransaction(req, res) {
    try {
        const { repair_id, amount, payment_method, routing_number, notes } = req.body;

        const invoice_number = generateInvoiceNumber();

        const [result] = await pool.query(
            `INSERT INTO transactions
             (repair_id, amount, payment_method, routing_number, invoice_number, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [repair_id, amount, payment_method, routing_number ?? null, invoice_number, notes ?? null]
        );

        // Mark repair as Completed
        await pool.query(
            "UPDATE repairs SET status = 'Completed', completion_date = CURDATE() WHERE repair_id = ?",
            [repair_id]
        );

        const [newTransaction] = await pool.query(
            "SELECT * FROM transactions WHERE transaction_id = ?",
            [result.insertId]
        );
        res.status(201).json(newTransaction[0]);
    } catch (error) {
        console.error("Error in createTransaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update payment status
export async function updateTransactionStatus(req, res) {
    try {
        const { payment_status, notes } = req.body;

        const [result] = await pool.query(
            "UPDATE transactions SET payment_status = ?, notes = ? WHERE transaction_id = ?",
            [payment_status, notes ?? null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM transactions WHERE transaction_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateTransactionStatus:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

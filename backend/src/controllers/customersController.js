import pool from "../config/db.js";

// GET all customers
export async function getAllCustomers(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM customers ORDER BY created_at DESC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllCustomers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET single customer by ID
export async function getCustomerById(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM customers WHERE customer_id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error in getCustomerById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create new customer
export async function createCustomer(req, res) {
    try {
        const {
            first_name,
            last_name,
            street_address,
            city,
            zip_code,
            email_address,
            phone_number,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO customers 
            (first_name, last_name, street_address, city, zip_code, email_address, phone_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, street_address, city, zip_code, email_address, phone_number]
        );

        const [newCustomer] = await pool.query(
            "SELECT * FROM customers WHERE customer_id = ?",
            [result.insertId]
        );
        res.status(201).json(newCustomer[0]);
    } catch (error) {
        console.error("Error in createCustomer:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email address already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update customer
export async function updateCustomer(req, res) {
    try {
        const {
            first_name,
            last_name,
            street_address,
            city,
            zip_code,
            email_address,
            phone_number,
        } = req.body;

        const [result] = await pool.query(
            `UPDATE customers SET
                first_name = ?, last_name = ?, street_address = ?, city = ?,
                zip_code = ?, email_address = ?, phone_number = ?
            WHERE customer_id = ?`,
            [first_name, last_name, street_address, city, zip_code, email_address, phone_number, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM customers WHERE customer_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateCustomer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE customer
export async function deleteCustomer(req, res) {
    try {
        const [result] = await pool.query(
            "DELETE FROM customers WHERE customer_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCustomer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

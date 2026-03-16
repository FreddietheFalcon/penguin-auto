import pool from "../config/db.js";

// GET all employees
export async function getAllEmployees(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM employees ORDER BY last_name ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getAllEmployees:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET active employees only (for assigning to repairs)
export async function getActiveEmployees(_, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM employees WHERE is_active = 1 ORDER BY last_name ASC"
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error in getActiveEmployees:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET employee by ID
export async function getEmployeeById(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM employees WHERE employee_id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error in getEmployeeById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST create employee
export async function createEmployee(req, res) {
    try {
        const {
            first_name, last_name, street_address, city, zip_code,
            email_address, phone_number, hourly_wage, position, hire_date,
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO employees
             (first_name, last_name, street_address, city, zip_code,
              email_address, phone_number, hourly_wage, position, hire_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, street_address, city, zip_code,
             email_address, phone_number, hourly_wage, position, hire_date]
        );

        const [newEmployee] = await pool.query(
            "SELECT * FROM employees WHERE employee_id = ?",
            [result.insertId]
        );
        res.status(201).json(newEmployee[0]);
    } catch (error) {
        console.error("Error in createEmployee:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email address already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

// PUT update employee
export async function updateEmployee(req, res) {
    try {
        const {
            first_name, last_name, street_address, city, zip_code,
            email_address, phone_number, hourly_wage, position, hire_date, is_active,
        } = req.body;

        const [result] = await pool.query(
            `UPDATE employees SET
                first_name = ?, last_name = ?, street_address = ?, city = ?,
                zip_code = ?, email_address = ?, phone_number = ?,
                hourly_wage = ?, position = ?, hire_date = ?, is_active = ?
             WHERE employee_id = ?`,
            [first_name, last_name, street_address, city, zip_code,
             email_address, phone_number, hourly_wage, position, hire_date,
             is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const [updated] = await pool.query(
            "SELECT * FROM employees WHERE employee_id = ?",
            [req.params.id]
        );
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error("Error in updateEmployee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE (soft delete — sets is_active = 0)
export async function deleteEmployee(req, res) {
    try {
        const [result] = await pool.query(
            "UPDATE employees SET is_active = 0 WHERE employee_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee deactivated successfully" });
    } catch (error) {
        console.error("Error in deleteEmployee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

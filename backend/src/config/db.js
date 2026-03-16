import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "penguin_auto",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("MySQL connected successfully");
        connection.release();
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
        process.exit(1);
    }
};

export default pool;

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DB_CONN, // ← Use DATABASE_URL
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Connection failed:", err.message);
  } else {
    console.log("Connected at:", res.rows[0].now);
  }
});

export default pool;

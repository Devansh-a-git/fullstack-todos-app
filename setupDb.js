require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Read the SQL file
const sqlFilePath = path.join(__dirname, "database.sql");
const sql = fs.readFileSync(sqlFilePath, "utf-8");

// Execute the SQL script
(async () => {
  const client = await pool.connect();
  try {
    console.log("Running database setup script...");
    await client.query(sql);
    console.log("Database setup completed successfully.");
  } catch (err) {
    console.error("Error executing database setup script:", err);
  } finally {
    client.release();
    pool.end();
  }
})();

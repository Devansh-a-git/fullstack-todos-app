const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

DATABASE_URL =
  "postgresql://devansh:U4QWwOKBLkrRVY7uRvxDFyHkG26CEwfK@dpg-d07tk66r433s73bkjf70-a.oregon-postgres.render.com/todo_db_ejd3";

const pool = new Pool({
  connectionString: DATABASE_URL,
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

const express = require("express");
const pool = require("../index");
const router = express.Router();

// GET /users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

// New API to get all tags associated with a user using query parameter
router.get("/tags", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res
      .status(400)
      .json({ error: "user_id query parameter is required" });
  }

  try {
    const query = `
            SELECT DISTINCT t.id, t.name
            FROM Tags t
            INNER JOIN Todo_Tags tt ON t.id = tt.tag_id
            INNER JOIN Todos td ON tt.todo_id = td.id
            WHERE td.user_id = $1;
        `;

    const { rows } = await pool.query(query, [user_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching tags for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

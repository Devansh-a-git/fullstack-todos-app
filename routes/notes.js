const express = require("express");
const pool = require("../index");
const router = express.Router();

// POST /todos/:id/notes
router.post("/:id/notes", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).send("Note content is required");
  }

  try {
    const result = await pool.query(
      "INSERT INTO Notes (content, todo_id) VALUES ($1, $2) RETURNING *",
      [content, id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding note to the todo");
  }
});

// GET /todos/:id/notes
router.get("/:id/notes", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM Notes WHERE todo_id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("No notes found for the specified todo");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching notes for the todo");
  }
});

module.exports = router;

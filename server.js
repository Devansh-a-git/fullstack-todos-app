const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./index"); // Reuse the database connection

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Todo List API is running!");
});

// Routes for Todos
app.get("/todos", async (req, res) => {
  const { user_id } = req.query; // Expecting user_id as a query parameter
  if (!user_id) {
    return res.status(400).send("user_id query parameter is required");
  }

  try {
    const result = await pool.query("SELECT * FROM Todos WHERE user_id = $1", [
      user_id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("No todos found for the specified user");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching todos for the user");
  }
});

app.post("/todos", async (req, res) => {
  const { title, description, priority, user_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Todos (title, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, priority, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating todo");
  }
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, priority } = req.body;
  try {
    const result = await pool.query(
      "UPDATE Todos SET title = $1, description = $2, priority = $3 WHERE id = $4 RETURNING *",
      [title, description, priority, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating todo");
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM Todos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.send("Todo deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting todo");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

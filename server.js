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

// Update POST /todos to handle tags
app.post("/todos", async (req, res) => {
  const { title, description, priority, user_id, tags } = req.body; // Accept tags in the request body
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert the todo
      const todoResult = await client.query(
        "INSERT INTO Todos (title, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, priority, user_id]
      );
      const todo = todoResult.rows[0];

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          // Check if the tag exists
          let tagResult = await client.query(
            "SELECT * FROM Tags WHERE name = $1",
            [tag]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            // Insert the tag if it doesn't exist
            tagResult = await client.query(
              "INSERT INTO Tags (name) VALUES ($1) RETURNING *",
              [tag]
            );
          }
          tagId = tagResult.rows[0].id;

          // Associate the tag with the todo
          await client.query(
            "INSERT INTO Todo_Tags (todo_id, tag_id) VALUES ($1, $2)",
            [todo.id, tagId]
          );
        }
      }

      await client.query("COMMIT");
      res.status(201).json(todo);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating todo");
  }
});

// Update PUT /todos/:id to handle tags
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, tags } = req.body; // Accept tags in the request body
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update the todo
      const todoResult = await client.query(
        "UPDATE Todos SET title = $1, description = $2, priority = $3 WHERE id = $4 RETURNING *",
        [title, description, priority, id]
      );
      if (todoResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).send("Todo not found");
      }
      const todo = todoResult.rows[0];

      // Handle tags
      if (tags && tags.length > 0) {
        // Remove existing tag associations
        await client.query("DELETE FROM Todo_Tags WHERE todo_id = $1", [id]);

        for (const tag of tags) {
          // Check if the tag exists
          let tagResult = await client.query(
            "SELECT * FROM Tags WHERE name = $1",
            [tag]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            // Insert the tag if it doesn't exist
            tagResult = await client.query(
              "INSERT INTO Tags (name) VALUES ($1) RETURNING *",
              [tag]
            );
          }
          tagId = tagResult.rows[0].id;

          // Associate the tag with the todo
          await client.query(
            "INSERT INTO Todo_Tags (todo_id, tag_id) VALUES ($1, $2)",
            [id, tagId]
          );
        }
      }

      await client.query("COMMIT");
      res.json(todo);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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

const express = require("express");
const pool = require("../index");
const router = express.Router();

// Add pagination to GET /todos
router.get("/", async (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
  if (!user_id) {
    return res.status(400).send("user_id query parameter is required");
  }

  const offset = (page - 1) * limit;

  try {
    const todosResult = await pool.query(
      "SELECT * FROM Todos WHERE user_id = $1 LIMIT $2 OFFSET $3",
      [user_id, limit, offset]
    );

    const todos = todosResult.rows;

    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching todos for the user");
  }
});

// Normalize priority to title case
const normalizePriority = (priority) => {
  if (!priority) return null;
  const lowerPriority = priority.toLowerCase();
  if (["high", "medium", "low"].includes(lowerPriority)) {
    return lowerPriority.charAt(0).toUpperCase() + lowerPriority.slice(1);
  }
  return null; // Invalid priority
};

// POST /todos
router.post("/", async (req, res) => {
  const { title, description, priority, user_id, tags, assignedUsers } =
    req.body; // Accept tags in the request body
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const normalizedPriority = normalizePriority(priority);
      if (!normalizedPriority) {
        return res
          .status(400)
          .send(
            "Invalid priority value. Allowed values are 'High', 'Medium', 'Low'."
          );
      }

      // Insert the todo
      const todoResult = await client.query(
        "INSERT INTO Todos (title, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, normalizedPriority, user_id]
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

      // Handle assignedUsers in POST /todos
      if (assignedUsers && assignedUsers.length > 0) {
        for (const userId of assignedUsers) {
          await client.query(
            "INSERT INTO Todo_Assigned_Users (todo_id, user_id) VALUES ($1, $2)",
            [todo.id, userId]
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

// PUT /todos/:id
router.put("/:id", async (req, res) => {
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

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
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

// GET /api/todos/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the todo by ID
    const todoResult = await pool.query("SELECT * FROM Todos WHERE id = $1", [
      id,
    ]);
    if (todoResult.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    const todo = todoResult.rows[0];

    // Fetch tags associated with the todo
    const tagsResult = await pool.query(
      "SELECT name FROM Tags t INNER JOIN Todo_Tags tt ON t.id = tt.tag_id WHERE tt.todo_id = $1",
      [id]
    );
    todo.tags = tagsResult.rows.map((row) => row.name) || [];

    // Fetch assigned users for the todo
    const assignedUsersResult = await pool.query(
      "SELECT username FROM Users u INNER JOIN Todo_Assigned_Users tau ON u.id = tau.user_id WHERE tau.todo_id = $1",
      [id]
    );
    todo.assignedUsers =
      assignedUsersResult.rows.map((row) => `@${row.username}`) || [];

    // Fetch notes associated with the todo
    const notesResult = await pool.query(
      "SELECT content, date FROM Notes WHERE todo_id = $1",
      [id]
    );
    todo.notes = notesResult.rows || [];

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching the todo");
  }
});

module.exports = router;

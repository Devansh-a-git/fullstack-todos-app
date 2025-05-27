const express = require("express");
const pool = require("../index");
const router = express.Router();
const { Parser } = require("json2csv");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = path.join(__dirname, "../data");
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Add pagination to GET /todos
router.post("/", async (req, res) => {
  const { user_id, page = 1, limit = 10, search = "" } = req.query; // Default to page 1 and limit 10
  const { filters = { tags: [], priority: [] }, sortBy = { date: "desc" } } =
    req.body;

  if (!user_id) {
    return res.status(400).send("user_id query parameter is required");
  }

  const orderBy = sortBy?.date
    ? `t.updated_at ${sortBy.date}`
    : `t.title ${sortBy.title}`;

  const offset = (page - 1) * limit;

  try {
    // Build the WHERE clause for filtering
    let paginationWhereClause =
      "t.user_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)";
    const paginationQueryParams = [user_id, `%${search}%`];

    let whereClause =
      "t.user_id = $1 AND (t.title ILIKE $4 OR t.description ILIKE $4)";
    const queryParams = [user_id, limit, offset, `%${search}%`];

    // Add priority filter if provided
    if (filters.priority && filters.priority.length > 0) {
      queryParams.push(filters.priority);
      paginationQueryParams.push(filters.priority);
      whereClause += ` AND t.priority = ANY($${queryParams.length})`;
      paginationWhereClause += ` AND t.priority = ANY($${paginationQueryParams.length})`;
    }

    // Add tags filter if provided
    if (filters.tags && filters.tags.length > 0) {
      queryParams.push(filters.tags);
      paginationQueryParams.push(filters.tags);
      whereClause += ` AND tg.id = ANY($${queryParams.length})`;
      paginationWhereClause += ` AND tg.id = ANY($${paginationQueryParams.length})`;
    }

    const todosResult = await pool.query(
      `SELECT t.*, 
              COALESCE(ARRAY_AGG(DISTINCT tg.name) FILTER (WHERE tg.name IS NOT NULL), '{}') AS tags, 
              COALESCE(ARRAY_AGG(DISTINCT u.username) FILTER (WHERE u.username IS NOT NULL), '{}') AS assigned_users
       FROM Todos t
       LEFT JOIN Todo_Tags tt ON t.id = tt.todo_id
       LEFT JOIN Tags tg ON tt.tag_id = tg.id
       LEFT JOIN Todo_Assigned_Users tu ON t.id = tu.todo_id
       LEFT JOIN Users u ON tu.user_id = u.id
       WHERE ${whereClause}
       GROUP BY t.id
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      queryParams
    );

    const totalTodosResult = await pool.query(
      `SELECT COUNT(DISTINCT t.id) AS total 
       FROM Todos t
       LEFT JOIN Todo_Tags tt ON t.id = tt.todo_id
       LEFT JOIN Tags tg ON tt.tag_id = tg.id
       WHERE ${paginationWhereClause}`,
      paginationQueryParams
    );

    const todos = todosResult.rows;
    const total = parseInt(totalTodosResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      todos,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit: limit,
        numberOfPages: totalPages,
      },
    });
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
router.post("/add_todo", async (req, res) => {
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

// PATCH /todos/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    priority,
    completed,
    tags,
    assignedUsers,
    notes,
  } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update the todo fields
      const updateQuery = `
        UPDATE Todos
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            priority = COALESCE($3, priority),
            completed = COALESCE($4, completed)
        WHERE id = $5
        RETURNING *;
      `;
      const todoResult = await client.query(updateQuery, [
        title,
        description,
        priority,
        completed,
        id,
      ]);

      if (todoResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).send("Todo not found");
      }

      const todo = todoResult.rows[0];

      // Update tags if provided
      if (tags) {
        await client.query("DELETE FROM Todo_Tags WHERE todo_id = $1", [id]);

        for (const tag of tags) {
          let tagResult = await client.query(
            "SELECT * FROM Tags WHERE name = $1",
            [tag]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            tagResult = await client.query(
              "INSERT INTO Tags (name) VALUES ($1) RETURNING *",
              [tag]
            );
          }
          tagId = tagResult.rows[0].id;

          await client.query(
            "INSERT INTO Todo_Tags (todo_id, tag_id) VALUES ($1, $2)",
            [id, tagId]
          );
        }
      }

      // Update assigned users if provided
      if (assignedUsers) {
        await client.query(
          "DELETE FROM Todo_Assigned_Users WHERE todo_id = $1",
          [id]
        );

        for (const userId of assignedUsers) {
          await client.query(
            "INSERT INTO Todo_Assigned_Users (todo_id, user_id) VALUES ($1, $2)",
            [id, userId]
          );
        }
      }

      // Handle notes
      if (notes) {
        await client.query("DELETE FROM Notes WHERE todo_id = $1", [id]);

        for (const note of notes) {
          await client.query(
            "INSERT INTO Notes (todo_id, content) VALUES ($1, $2)",
            [id, note["content"]]
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
    todo.assigned_users =
      assignedUsersResult.rows.map((row) => row.username) || [];

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

router.get("/:id/export", async (req, res) => {
  const { id } = req.params;
  const { format = "json" } = req.query;

  console.log("NEWWWWWW :::: ", id, format);

  if (!id) {
    return res.status(400).send("user_id query parameter is required");
  }

  try {
    const todosResult = await pool.query(
      `SELECT t.*, 
              COALESCE(ARRAY_AGG(DISTINCT tg.name) FILTER (WHERE tg.name IS NOT NULL), '{}') AS tags, 
              COALESCE(ARRAY_AGG(DISTINCT u.username) FILTER (WHERE u.username IS NOT NULL), '{}') AS assigned_users,
              COALESCE(JSON_AGG(DISTINCT n) FILTER (WHERE n.content IS NOT NULL), '[]') AS notes
       FROM Todos t
       LEFT JOIN Todo_Tags tt ON t.id = tt.todo_id
       LEFT JOIN Tags tg ON tt.tag_id = tg.id
       LEFT JOIN Todo_Assigned_Users tu ON t.id = tu.todo_id
       LEFT JOIN Users u ON tu.user_id = u.id
       LEFT JOIN Notes n ON t.id = n.todo_id
       WHERE t.user_id = $1
       GROUP BY t.id`,
      [id]
    );

    const todos = todosResult.rows;

    if (format === "csv") {
      const fields = [
        "id",
        "title",
        "description",
        "priority",
        "completed",
        "tags",
        "assigned_users",
        "notes",
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(todos);

      res.header("Content-Type", "text/csv");
      res.attachment("todos.csv");
      return res.send(csv);
    }

    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting todos");
  }
});

router.post("/import", upload.single("file"), async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).send("user_id query parameter is required");
  }

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const client = await pool.connect();

  try {
    if (!req.file.originalname.endsWith(".csv")) {
      throw new Error("Please upload a CSV file.");
    }

    const fileContent = await fs.readFile(req.file.path, "utf-8");
    let todos = [];

    const lines = fileContent.split("\n");
    const headers = lines[0].split(",");

    todos = lines
      .slice(1)
      .map((line) => {
         console.log(line);
        const values = line.split(",");
        const todo = {};
        headers.forEach((header, index) => {
          debugger
          // console.log(values, index, values[index]?.trim());
          let value = values[index]?.trim();
          if (header === "tags" || header === "assigned_users") {
            try {
              debugger
              value = value.split(',') // JSON.parse(value.replace(/'/g, '"')) || [];
            } catch (e) {
              value = [];
            }
          }
          todo[header.trim()] = value;
        });
        return todo;
      })
      .filter((todo) => todo.title);

    if (todos.length === 0) {
      throw new Error("No valid todos found in the CSV file.");
    }

    await client.query("BEGIN");

    for (const todo of todos) {
      const normalizedPriority = normalizePriority(todo.priority);

      const todoResult = await client.query(
        "INSERT INTO Todos (title, description, priority, completed, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          todo.title,
          todo.description,
          normalizedPriority || "Medium",
          todo.completed || false,
          user_id,
        ]
      );

      const newTodo = todoResult.rows[0];

      // console.log("qwerty :::::: ", todo);

      if (todo.tags && Array.isArray(todo.tags)) {
        for (const tag of todo.tags) {
          let tagResult = await client.query(
            "SELECT * FROM Tags WHERE name = $1",
            [tag]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            tagResult = await client.query(
              "INSERT INTO Tags (name) VALUES ($1) RETURNING *",
              [tag]
            );
          }
          tagId = tagResult.rows[0].id;

          await client.query(
            "INSERT INTO Todo_Tags (todo_id, tag_id) VALUES ($1, $2)",
            [newTodo.id, tagId]
          );
        }
      }

      if (todo.assigned_users && Array.isArray(todo.assigned_users)) {
        for (const username of todo.assigned_users) {
          const userResult = await client.query(
            "SELECT id FROM Users WHERE username = $1",
            [username]
          );
          if (userResult.rows.length > 0) {
            await client.query(
              "INSERT INTO Todo_Assigned_Users (todo_id, user_id) VALUES ($1, $2)",
              [newTodo.id, userResult.rows[0].id]
            );
          }
        }
      }
    }

    await client.query("COMMIT");

    await fs.unlink(req.file.path);

    res
      .status(201)
      .json({ message: `Successfully imported ${todos.length} todos` });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error importing todos:", error);

    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error("Error deleting file:", unlinkError);
    }

    res.status(500).json({
      error: "Error importing todos",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;

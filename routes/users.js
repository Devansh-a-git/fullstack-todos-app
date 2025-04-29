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

module.exports = router;

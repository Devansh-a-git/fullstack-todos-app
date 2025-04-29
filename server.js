const express = require("express");
const bodyParser = require("body-parser");
const todoRoutes = require("./routes/todos");
const noteRoutes = require("./routes/notes");
const userRoutes = require("./routes/users");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(morgan("dev")); // Add logging middleware

app.get("/", (req, res) => {
  res.send("Todo List APP is running!");
});

app.use("/api/todos", todoRoutes);
app.use("/api/todos", noteRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

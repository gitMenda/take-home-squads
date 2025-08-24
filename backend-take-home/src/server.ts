import express from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json()); // needed to parse JSON request bodies

// GET route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// POST route
app.post("/api", (req, res) => {
  const { text } = req.body;
  res.json({ reply: `Backend received: "${text}"` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

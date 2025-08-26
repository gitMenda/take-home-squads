import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateIcebreaker } from "./controllers/linkedinController";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api", (req, res) => {
  const { text } = req.body;
  res.json({ reply: `Backend received: "${text}"` });
});

// Register the icebreaker route with the controller function
app.post("/api/generate-icebreaker", generateIcebreaker);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
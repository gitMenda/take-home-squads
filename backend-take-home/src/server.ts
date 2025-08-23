import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

// Middleware
app.use(cors()); // allow requests from frontend
app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:${PORT}");
});

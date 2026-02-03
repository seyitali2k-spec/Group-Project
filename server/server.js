import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db/connection.js";
import drinksRoutes from "./routes/drinks.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "CAFI - Caffeine API",
    status: "Server is running!",
    endpoints: {
      drinks: "/api/drinks",
    },
  });
});

// Use drinks routes
app.use("/api/drinks", drinksRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API access http://localhost:${PORT}/api/drinks`);
});

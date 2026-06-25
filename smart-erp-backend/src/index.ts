import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors({ origin: "*" })); // Allows your Next.js app to make cross-origin requests
app.use(express.json());

// Base Server Health check
app.get("/health", async (req, res) => {
  try {
    // Basic ping test to verify our connection to Neon Postgres is alive
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "UP", database: "CONNECTED" });
  } catch (error) {
    res.status(500).json({ status: "DOWN", error: (error as Error).message });
  }
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log(`🚀 SmartERP Backend Engine fired up on port ${PORT}`);
});

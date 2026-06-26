import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import mastersRoutes from "./routes/masters.routes.js";
import voucherRoutes from "./routes/voucher.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Bind API Core Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/masters", mastersRoutes);
app.use("/api/transactions", voucherRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "UP", database: "CONNECTED" });
  } catch (error) {
    res.status(500).json({ status: "DOWN", error: (error as Error).message });
  }
});

// Centralized error handling fallback middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("💥 Server Error Context:", err.stack);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  },
);

app.listen(PORT, () => {
  console.log(`🚀 SmartERP Backend Engine fired up on port ${PORT}`);
});

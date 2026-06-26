import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";
import { getPartyLedgerReport } from "../controllers/reports.controller.js";

const router = Router();

router.use(authenticateToken as any);

// Dashboard Reporting Context
router.get("/:companyId/dashboard", getDashboardMetrics as any);

// Ledger Book Tracking Context
router.get("/:companyId/ledger-statement", getPartyLedgerReport as any);

export default router;

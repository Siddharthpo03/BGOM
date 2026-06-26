import { Router } from "express";
import {
  createCompany,
  getCompanies,
} from "../controllers/company.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure both routes — ensure it points to "/" and NOT "/api/companies"
router.post("/", authenticateToken as any, createCompany as any);
router.get("/", authenticateToken as any, getCompanies as any);

export default router;

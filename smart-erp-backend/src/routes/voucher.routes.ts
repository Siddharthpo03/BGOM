import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createVoucher,
  getVouchers,
} from "../controllers/voucher.controller.js";

const router = Router();

router.use(authenticateToken as any);

router.post("/:companyId/vouchers", createVoucher as any);
router.get("/:companyId/vouchers", getVouchers as any);

export default router;

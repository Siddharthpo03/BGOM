import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createCustomer,
  getCustomers,
  createSupplier,
  getSuppliers,
  createStockGroup,
  getStockGroups,
  createStockItem,
  getStockItems,
} from "../controllers/masters.controller.js";

const router = Router();

// Secure all contextual routes with our global middleware
router.use(authenticateToken as any);

// Customer Paths
router.post("/:companyId/customers", createCustomer as any);
router.get("/:companyId/customers", getCustomers as any);

// Supplier Paths
router.post("/:companyId/suppliers", createSupplier as any);
router.get("/:companyId/suppliers", getSuppliers as any);

// Stock Group Paths
router.post("/:companyId/stock-groups", createStockGroup as any);
router.get("/:companyId/stock-groups", getStockGroups as any);

// Stock Item Paths
router.post("/:companyId/stock-items", createStockItem as any);
router.get("/:companyId/stock-items", getStockItems as any);

export default router;

import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { z } from "zod";

// ==========================================
// 📋 REQUEST VALIDATION SCHEMAS
// ==========================================

export const partySchema = z.object({
  name: z.string().min(2, "Name is too short"),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  outstandingBalance: z.number().default(0),
});

export const stockGroupSchema = z.object({
  name: z.string().min(2, "Group name is too short"),
});

export const stockItemSchema = z.object({
  name: z.string().min(2, "Item name is too short"),
  sku: z.string().min(2, "SKU identifier required"),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  quantity: z.number().int().default(0),
  gstPercentage: z.number().default(0),
  stockGroupId: z.string().optional(),
});

// ==========================================
// 🛠️ TYPE-SAFE PARAMETER HELPERS
// ==========================================

const getCompanyId = (req: AuthenticatedRequest): string => {
  const { companyId } = req.params;
  if (!companyId || typeof companyId !== "string") {
    throw new Error("Invalid or missing Company ID parameter");
  }
  return companyId;
};

// ==========================================
// 👥 CUSTOMER CONTROLLERS
// ==========================================

export const createCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const data = partySchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: data.name,
        mobile: data.mobile ?? null,
        email: data.email && data.email !== "" ? data.email : null,
        address: data.address ?? null,
        outstandingBalance: data.outstandingBalance,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const customers = await prisma.customer.findMany({ where: { companyId } });
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🤝 SUPPLIER CONTROLLERS
// ==========================================

export const createSupplier = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const data = partySchema.parse(req.body);

    const supplier = await prisma.supplier.create({
      data: {
        companyId,
        name: data.name,
        mobile: data.mobile ?? null,
        email: data.email && data.email !== "" ? data.email : null,
        address: data.address ?? null,
        outstandingBalance: data.outstandingBalance,
      },
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const suppliers = await prisma.supplier.findMany({ where: { companyId } });
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 📦 STOCK GROUP CONTROLLERS
// ==========================================

export const createStockGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const data = stockGroupSchema.parse(req.body);

    const group = await prisma.stockGroup.create({
      data: { companyId, name: data.name },
    });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const getStockGroups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const groups = await prisma.stockGroup.findMany({ where: { companyId } });
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🏷️ STOCK ITEM CONTROLLERS
// ==========================================

export const createStockItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const data = stockItemSchema.parse(req.body);

    const item = await prisma.stockItem.create({
      data: {
        companyId,
        name: data.name,
        sku: data.sku,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        quantity: data.quantity,
        gstPercentage: data.gstPercentage,
        stockGroupId: data.stockGroupId ?? null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const getStockItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const items = await prisma.stockItem.findMany({
      where: { companyId },
      include: { stockGroup: true },
    });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

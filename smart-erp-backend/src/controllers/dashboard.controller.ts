import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";

const getCompanyId = (req: AuthenticatedRequest): string => {
  const { companyId } = req.params;
  if (!companyId || typeof companyId !== "string") {
    throw new Error("Invalid or missing Company ID parameter");
  }
  return companyId;
};

export const getDashboardMetrics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);

    // Concurrent execution across reporting tables
    const [
      salesSummary,
      purchaseSummary,
      lowStockItems,
      totalCustomers,
      totalSuppliers,
    ] = await Promise.all([
      // Sum total sales volume
      prisma.voucher.aggregate({
        where: { companyId, type: "SALES" },
        _sum: { totalAmount: true, totalTax: true },
      }),
      // Sum total purchase volume
      prisma.voucher.aggregate({
        where: { companyId, type: "PURCHASE" },
        _sum: { totalAmount: true, totalTax: true },
      }),
      // Identify low inventory counts (threshold less than 10 units)
      prisma.stockItem.findMany({
        where: { companyId, quantity: { lt: 10 } },
        select: { id: true, name: true, sku: true, quantity: true },
      }),
      // Fetch aggregate outstanding receivables
      prisma.customer.aggregate({
        where: { companyId },
        _sum: { outstandingBalance: true },
      }),
      // Fetch aggregate outstanding payables
      prisma.supplier.aggregate({
        where: { companyId },
        _sum: { outstandingBalance: true },
      }),
    ]);

    res.status(200).json({
      metrics: {
        revenue: Number(salesSummary._sum.totalAmount || 0),
        taxCollected: Number(salesSummary._sum.totalTax || 0),
        expenses: Number(purchaseSummary._sum.totalAmount || 0),
        taxPaid: Number(purchaseSummary._sum.totalTax || 0),
        receivables: Number(totalCustomers._sum.outstandingBalance || 0),
        payables: Number(totalSuppliers._sum.outstandingBalance || 0),
        netProfit:
          Number(salesSummary._sum.totalAmount || 0) -
          Number(purchaseSummary._sum.totalAmount || 0),
      },
      inventoryAlerts: lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};

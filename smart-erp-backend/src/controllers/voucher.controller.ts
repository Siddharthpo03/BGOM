import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { z } from "zod";

export const voucherItemSchema = z.object({
  stockItemId: z.string().min(1, "Stock Item ID is required"),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
  price: z.number().positive("Price must be greater than zero"),
  taxAmount: z.number().default(0),
});

export const voucherSchema = z.object({
  type: z.enum(["SALES", "PURCHASE"]),
  partyId: z.string().min(1, "Party ID (Customer/Supplier) is required"),
  date: z.string().default(() => new Date().toISOString()),
  items: z
    .array(voucherItemSchema)
    .min(1, "Voucher must contain at least one item"),
});

const getCompanyId = (req: AuthenticatedRequest): string => {
  const { companyId } = req.params;
  if (!companyId || typeof companyId !== "string") {
    throw new Error("Invalid or missing Company ID parameter");
  }
  return companyId;
};

export const createVoucher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const data = voucherSchema.parse(req.body);

    // Calculate absolute totals across lines
    let totalAmount = 0;
    let totalTax = 0;
    data.items.forEach((item) => {
      totalAmount += item.quantity * item.price + item.taxAmount;
      totalTax += item.taxAmount;
    });

    // Execute safe ACID transaction block
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the base Voucher entry
      const voucher = await tx.voucher.create({
        data: {
          companyId,
          type: data.type,
          partyId: data.partyId,
          date: new Date(data.date),
          totalAmount,
          totalTax,
        },
      });

      // 2. Loop through lines to record items and mutate active stock levels
      for (const item of data.items) {
        await tx.voucherItem.create({
          data: {
            voucherId: voucher.id,
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            price: item.price,
            taxAmount: item.taxAmount,
          },
        });

        // SALES drops physical inventory counts; PURCHASES increases them
        const inventoryAdjustment =
          data.type === "SALES" ? -item.quantity : item.quantity;

        await tx.stockItem.update({
          where: { id: item.stockItemId },
          data: {
            quantity: {
              increment: inventoryAdjustment,
            },
          },
        });
      }

      return voucher;
    });

    res
      .status(201)
      .json({
        message: `${data.type} Voucher processed cleanly`,
        voucher: result,
      });
  } catch (error) {
    next(error);
  }
};

export const getVouchers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const vouchers = await prisma.voucher.findMany({
      where: { companyId },
      include: {
        items: {
          include: { stockItem: true },
        },
      },
      orderBy: { date: "desc" },
    });
    res.status(200).json(vouchers);
  } catch (error) {
    next(error);
  }
};

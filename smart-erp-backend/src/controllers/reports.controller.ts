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

export const getPartyLedgerReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companyId = getCompanyId(req);
    const { partyId } = req.query;

    if (!partyId || typeof partyId !== "string") {
      res.status(400).json({ message: "partyId query parameter is required" });
      return;
    }

    const statement = await prisma.voucher.findMany({
      where: { companyId, partyId },
      include: {
        items: { include: { stockItem: true } },
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
};

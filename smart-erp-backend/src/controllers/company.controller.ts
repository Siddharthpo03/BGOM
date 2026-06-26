import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Company name is too short"),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  financialYear: z.string().default("2026-2027"),
  state: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const createCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized context" });
      return;
    }

    // Enforce the 5-company limit constraint specified in the document
    const userCompanyCount = await prisma.userCompany.count({
      where: { userId },
    });

    if (userCompanyCount >= 5) {
      res
        .status(400)
        .json({
          message:
            "Limit reached. Maximum of 5 companies allowed per user account.",
        });
      return;
    }

    const validatedData = companySchema.parse(req.body);

    // Execute an ACID transaction to create the company and map the role dynamically
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: validatedData.name,
          address: validatedData.address ?? null,
          gstNumber: validatedData.gstNumber ?? null,
          financialYear: validatedData.financialYear,
          state: validatedData.state ?? null,
          contactNumber: validatedData.contactNumber ?? null,
        },
      });

      await tx.userCompany.create({
        data: {
          userId,
          companyId: company.id,
          role: "OWNER",
        },
      });

      return company;
    });

    res
      .status(201)
      .json({ message: "Company created successfully", company: result });
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized context" });
      return;
    }

    const companies = await prisma.company.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "An account with this email already exists." });
      return;
    }

    // Securely hash the password string
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the user inside Neon Postgres
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user record
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res
        .status(401)
        .json({ message: "Invalid email or password credentials." });
      return;
    }

    // Verify password match
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ message: "Invalid email or password credentials." });
      return;
    }

    // Generate JWT payload session token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { AuthRequest } from "../types/types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 0,
      message: "Unauthorized users can not access this resource",
      payload: [],
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      emp_id: number;
    };
    const user = await prisma.employee.findUnique({
      where: { id: decoded.emp_id },
    });
    req.userRecord = user; // Attach user to the request object for later use
    next();
  } catch (error) {
    res.status(401).json({
      status: 0,
      message: "Invalid or expired token",
      payload: [],
    });
  }
};
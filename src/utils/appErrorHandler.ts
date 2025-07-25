import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

type AppErrorResponse = {
  status: number;
  message: string;
  payload: any[];
};

export function handleAppError(error: unknown): AppErrorResponse {
  // ✅ Prisma known client errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        let fieldsRaw = error.meta?.target;
        let fields: string[] = [];

        if (typeof fieldsRaw === "string") {
          fields = [fieldsRaw];
        } else if (Array.isArray(fieldsRaw)) {
          fields = fieldsRaw;
        }
        return {
          status: 409,
          message: `Duplicate entry for field(s): ${fields.join(", ")}`,
          payload: [],
        };
      }
      case "P2025":
        return {
          status: 404,
          message: "Record not found.",
          payload: [],
        };
      default:
        return {
          status: 400,
          message: `Database error [${error.code}]`,
          payload: [],
        };
    }
  }

  // ✅ Prisma validation errors (optional)
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      message: "Invalid input. Prisma validation failed.",
      payload: [],
    };
  }

  // ✅ Zod validation errors
  if (error instanceof ZodError) {
    return {
      status: 422,
      message: error.errors[0].message,
      payload: [],
    };
  }

  // ✅ Manual Errors (e.g. `throw new Error("...")`)
  if (error instanceof Error) {
    return {
      status: 400,
      message: error.message,
      payload: [],
    };
  }

  // ❌ Unknown or unexpected errors
  return {
    status: 500,
    message: "Internal server error.",
    payload: [],
  };
}

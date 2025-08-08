// routes/v2/index.ts
import { Router } from "express";
import attendanceRoutes from "./attendanceRoute"; // You can create modules like v1

const router = Router();

router.use("/attendances", attendanceRoutes);

router.get("/", (req, res) => {
  res.status(200).json({
    status: 1,
    message: "Welcome to API V2",
    payload: {
      version: "v2",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
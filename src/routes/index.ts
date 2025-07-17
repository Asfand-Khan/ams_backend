import { Router } from "express";
import departmentRoutes from "./departmentRoutes";
import employeeRoutes from "./employeeRoutes";
import authRoutes from "./authRoutes";
import attendanceRoutes from "./attendanceRoute";
import leaveTypeRoutes from "./leaveTypeRoutes";
import officeLocationsRoutes from "./officeLocationRoute";
import leaveRoutes from "./leaveRoutes";
import attendanceCorrectionRoutes from "./attendanceCorrectionRoutes";
import assetComplaintRoutes from "./assetComplaintRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/attendances", attendanceRoutes);
router.use("/leave-types", leaveTypeRoutes);
router.use("/office-locations", officeLocationsRoutes);
router.use("/leaves", leaveRoutes);
router.use("/attendance-corrections", attendanceCorrectionRoutes);
router.use("/asset-complaints", assetComplaintRoutes);

router.get("/", (req, res) => {
  const dateObj = new Date();
  const date = dateObj.getDate();
  const time = dateObj.getTime().toLocaleString("en-US");
  res.status(200).json({
    status: 1,
    message: "Asset complaints fetched successfully",
    payload: `${date} - ${time}`,
  });
});
export default router;

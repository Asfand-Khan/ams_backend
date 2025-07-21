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
import wifiNetworkRoutes from "./officeWifiNetworkRoutes";

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
router.use("/wifi-networks", wifiNetworkRoutes);

router.get("/", (req, res) => {
  const dateObj = new Date();
  const date = dateObj.toISOString().split("T")[0]; // e.g., "2025-07-16"
  const time = dateObj.toTimeString().split(" ")[0]; // e.g., "14:30:45"

  res.status(200).json({
    status: 1,
    message: "Asset complaints fetched successfully",
    payload: `${date} - ${time}`,
  });
});
export default router;

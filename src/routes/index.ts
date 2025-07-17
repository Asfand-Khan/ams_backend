import { Router } from 'express';
import departmentRoutes from './departmentRoutes';
import employeeRoutes from './employeeRoutes';
import authRoutes from './authRoutes';
import attendanceRoutes from './attendanceRoute';
import leaveTypeRoutes from './leaveTypeRoutes';
import officeLocationsRoutes from './officeLocationRoute';
import leaveRoutes from './leaveRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/leave-types', leaveTypeRoutes);
router.use('/office-locations', officeLocationsRoutes);
router.use('/leaves', leaveRoutes);

export default router;
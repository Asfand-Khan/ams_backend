import { Router } from 'express';
import departmentRoutes from './departmentRoutes';
import employeeRoutes from './employeeRoutes';
import authRoutes from './authRoutes';
import attendanceRoutes from './attendanceRoute';
import leaveTypeRoutes from './leaveTypeRoutes';

const router = Router();

// Mount specific resource routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/leave-types', leaveTypeRoutes);

export default router;
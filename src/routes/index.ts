import { Router } from 'express';

const router = Router();

// Mount specific resource routes
router.use('/departments', require('./departmentRoutes'));

export default router;
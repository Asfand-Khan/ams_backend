import { Router } from 'express';

const router = Router();

// Mount specific resource routes
router.use('/users', () => {
    return {
        "message": "Dummy route"
    };
});

export default router;
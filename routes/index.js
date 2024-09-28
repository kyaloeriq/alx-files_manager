// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// New route for creating a user
router.post('/users', UsersController.postNew);

export default router;

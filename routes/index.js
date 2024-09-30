// routes/index.js
import express from 'express';
import FilesController from '../controllers/FilesController.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/files', FilesController.postUpload);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

export default router;

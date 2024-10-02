// routes/index.js

import express from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';

const router = express.Router();
const express = require('express');
const AuthController = require('../controllers/AuthController');
const UsersController = require('../controllers/UsersController');

// Define the endpoints and map them to controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

// Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// User routes
router.get('/users/me', UsersController.getMe);

export default router;

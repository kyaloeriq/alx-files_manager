// controllers/AuthController.js

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js'; // Import your Redis client

class AuthController {
  static async getConnect(req, res) {
    // Decode the Basic Auth credentials
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    // Hash the password using SHA1
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

    // Find the user in the database
    const user = await dbClient.db.collection('users').findOne({ email, password: sha1Password });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a token and store it in Redis
    const token = uuidv4();
    const key = auth_${token};
    await redisClient.set(key, user._id, 'EX', 86400); // Set expiry to 24 hours

    // Return the token
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = auth_${token};
    const result = await redisClient.del(key); // Delete the token from Redis

    if (result === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(204).send(); // No content
  }
}

export default AuthController;

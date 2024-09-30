// controllers/AuthController.js

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js'; // Import your Redis client

class AuthController {
  // Method to handle /connect (login)
  static async getConnect(req, res) {
    try {
      // Check if Authorization header is present
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Decode the Basic Auth credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      // Hash the password using SHA1
      const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

      // Find the user in the MongoDB database
      const user = await dbClient.db.collection('users').findOne({ email, password: sha1Password });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token (UUID) and store it in Redis with a 24-hour expiration
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 'EX', 86400); // 86400 seconds = 24 hours

      // Return the generated token
      return res.status(200).json({ token });
    } catch (error) {
      // Handle unexpected server errors
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;

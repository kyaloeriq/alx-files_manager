import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js'; // Assuming Redis client is set up
import dbClient from '../utils/db.js'; // MongoDB client
import sha1 from 'sha1'; // Use this for password hashing

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode the Base64 authentication header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user in the database
    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a token and store the user ID in Redis for 24 hours
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.setex(key, 86400, user._id.toString()); // 86400 seconds = 24 hours

    // Return the token
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userKey = `auth_${token}`;
    const userId = await redisClient.get(userKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Remove the token from Redis
    await redisClient.del(userKey);
    return res.status(204).send();
  }
}

export default AuthController;

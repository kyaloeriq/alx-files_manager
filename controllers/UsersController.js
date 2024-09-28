// controllers/UsersController.js

import crypto from 'crypto';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js'; // Import your Redis client

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if user already exists
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

    // Insert the new user into the database
    try {
      const result = await dbClient.db.collection('users').insertOne({ email, password: sha1Password });
      const newUser = {
        id: result.insertedId, // MongoDB generates this ID
        email,
      };

      // Return the new user with status code 201
      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).json({ error: 'Error creating new user' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key); // Get the user ID from Redis

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user object with email and ID
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;

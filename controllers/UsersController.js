// controllers/UsersController.js

import dbClient from '../utils/db.js';
import crypto from 'crypto';

class UsersController {
  // POST /users - Create a new user
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate that email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists
    const usersCollection = dbClient.db.collection('users');
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

    // Insert the new user into the users collection
    const newUser = {
      email,
      password: sha1Password
    };

    try {
      const result = await usersCollection.insertOne(newUser);

      // Return the newly created user with id and email only
      return res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      console.error('Error inserting new user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;

// controllers/UsersController.js

import dbClient from '../utils/db.js';  // Ensure dbClient is correctly set up in utils/db.js
import sha1 from 'sha1';  // For password hashing

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const usersCollection = dbClient.db.collection('users');

      // Check if the user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Insert the new user into the users collection
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Respond with the new user's id and email
      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;

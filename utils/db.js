// utils/db.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    
    // Attempt to connect to the database
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
    });
  }

  // Method to check if the MongoDB client is connected
  isAlive() {
    try {
        return !!this.client.db();  // Checks if the client is connected to the database
    } catch (error) {
        console.error('Error in isAlive:', error);
        return false;
    }
  }

  // Async method to get the number of users
  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      return await usersCollection.countDocuments();
    } catch (error) {
      console.error('Error fetching users count:', error);
      return 0;
    }
  }

  // Async method to get the number of files
  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      return await filesCollection.countDocuments();
    } catch (error) {
      console.error('Error fetching files count:', error);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;

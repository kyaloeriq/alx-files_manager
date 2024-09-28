// controllers/AppController.js

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive(); // From your MongoDB utility.
    
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers(); // Returns the number of users in the collection.
    const files = await dbClient.nbFiles(); // Returns the number of files in the collection.

    res.status(200).json({ users, files });
  }
}

export default AppController;

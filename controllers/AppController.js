// controllers/AppController.js

import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';  // Assuming a Redis client utility exists

class AppController {
  // Handler for /status - returns Redis and DB statuses
  static async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  // Handler for /stats - returns the number of users and files in the database
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;

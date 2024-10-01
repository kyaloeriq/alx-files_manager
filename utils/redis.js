// utils/redis.js

import redis from 'redis';
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();

    // Handle errors emitted by the Redis client
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Promisify the Redis methods for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Method to check if the client is connected to Redis
  isAlive() {
    return this.client.connected;
  }

  // Async method to get a value from Redis by key
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  // Async method to set a value in Redis with an expiration time
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  // Async method to delete a value from Redis by key
  async del(key) {
    await this.delAsync(key);
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

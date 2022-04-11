/* eslint no-console: ["error", { allow: ["error"] }] */
const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this.client.on('error', (error) => {
      console.error(error);
    });

    this.client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    await this.client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this.client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan');
    return result;
  }

  delete(key) {
    return this.client.del(key);
  }
}

module.exports = CacheService;

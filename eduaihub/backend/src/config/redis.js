const redis = require('redis');

const redisUrl = process.env.REDIS_URL;
let rawClient = null;

if (redisUrl) {
  rawClient = redis.createClient({ url: redisUrl });

  rawClient.on('connect', () => {
    console.log('Redis connected');
  });

  rawClient.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  rawClient.connect().catch((err) => {
    console.error('Redis connection failed:', err.message);
  });
} else {
  console.warn('REDIS_URL is not set. Continuing without cache.');
}

const isReady = () => Boolean(rawClient && rawClient.isReady);

const get = async (key) => {
  if (!isReady()) {
    return null;
  }

  try {
    return await rawClient.get(key);
  } catch (err) {
    console.error('Redis get failed:', err.message);
    return null;
  }
};

const setEx = async (key, ttlSeconds, value) => {
  if (!isReady()) {
    return false;
  }

  try {
    await rawClient.setEx(key, ttlSeconds, value);
    return true;
  } catch (err) {
    console.error('Redis setEx failed:', err.message);
    return false;
  }
};

module.exports = {
  get,
  setEx,
  isReady,
  getRawClient: () => rawClient
};

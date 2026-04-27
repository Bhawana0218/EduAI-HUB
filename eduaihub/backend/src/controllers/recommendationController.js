const { getAIRecommendations } = require('../services/aiService');
const redisClient = require('../config/redis');

exports.getRecommendations = async (req, res) => {
  try {
    const topic = (req.body.topic || req.body.query || req.body.description || '').trim();
    const level = (req.body.level || 'Any').trim();

    if (!topic) {
      return res.status(400).json({
        message: 'Topic is required'
      });
    }

    const cacheKey = `ai:${topic.toLowerCase()}:${level.toLowerCase()}`;
    
    // Robust Redis Cache Check
    if (redisClient && typeof redisClient.get === 'function') {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          return res.json({
            success: true,
            source: 'cache',
            count: cachedData.length,
            data: cachedData
          });
        }
      } catch (err) {
        console.warn('Redis cache read failed:', err.message);
      }
    }

    // Generate AI recommendations
    const recommendations = await getAIRecommendations({ topic, level }) || [];
    
    if (recommendations.length > 0 && redisClient && typeof redisClient.setEx === 'function') {
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(recommendations))
        .catch(err => console.warn('Redis cache write failed:', err.message));
    }

    return res.json({
      success: true,
      source: 'ai',
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    return res.status(500).json({
      message: 'AI recommendation failed',
      error: error.message
    });
  }
};

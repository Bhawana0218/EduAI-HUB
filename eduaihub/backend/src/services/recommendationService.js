// services/recommendationService.js
const Course = require("../models/Course");

async function getHybridRecommendations(topic, level, aiRecommendations) {
  // DB-based
  const dbCourses = await Course.find({ category: topic, level });

  // Merge logic
  const merged = [
    ...dbCourses.map(c => ({
      source: "db",
      title: c.title,
      url: c.url
    })),
    ...aiRecommendations.map(a => ({
      source: "ai",
      ...a
    }))
  ];

  return merged;
}

module.exports = { getHybridRecommendations };
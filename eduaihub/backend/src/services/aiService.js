const { GoogleGenerativeAI } = require('@google/generative-ai');
const Course = require('../models/Course');

const DEFAULT_MODEL = "gemini-1.5-flash-latest" || "gemini-1.5-pro-latest";
const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

const extractJson = (rawText) => {
  const trimmed = (rawText || '').trim();

  try {
    return JSON.parse(trimmed);
  } catch (err) {
    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) return JSON.parse(fenced[1]);

    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw err;
  }
};

const getGeminiRecommendations = async ({ topic, level }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("AI Service: GEMINI_API_KEY is missing. Falling back to Database Keyword Match.");
    // Requirement 1b Fallback: Simulate AI by matching keywords from the description to DB
    const keywords = topic.split(/\s+/).filter(w => w.length >= 3).slice(0, 8);
    const fallbackCourses = await Course.find({
      $or: [
        { category: { $regex: topic, $options: 'i' } },
        { title: { $regex: keywords.join('|'), $options: 'i' } }
      ]
    }).limit(3).lean();

    return fallbackCourses.map(c => ({
      title: c.title,
      university: c.university,
      matchScore: 85,
      reason: "Matched based on your interest in " + (c.category || "this field")
    }));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // 🔥 STEP 1: FETCH POTENTIALLY RELEVANT COURSES
  // We extract keywords to pre-filter the DB so the AI sees relevant data
  const keywords = topic.split(/\s+/).filter(w => w.length >= 3);
  let courses = [];
  
  if (keywords.length > 0) {
    const searchRegex = new RegExp(keywords.join('|'), 'i');
    courses = await Course.find({
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ]
    }).limit(40).lean();
  }

  // Fallback to latest courses if no specific keyword matches found
  if (courses.length < 5) {
    const additional = await Course.find().sort({ updatedAt: -1 }).limit(40).lean();
    courses = [...courses, ...additional].slice(0, 50);
  }

  const courseText = courses.map((c, i) => ({
    id: i,
    title: c.title,
    university: c.university,
    category: c.category,
    level: c.level,
    description: (c.description || '').substring(0, 160)
  }));

  // 🔥 STEP 2: SMART AI SCORING PROMPT
const prompt = `
You are a Senior Academic Advisor. Your task is to match a student's profile to the most relevant courses from our university database.

STRICT CONSTRAINTS:
1. ONLY recommend courses from the provided DATABASE LIST below.
2. DO NOT invent course names, universities, or descriptions.
3. If no perfect match exists, select the closest relevant academic alternatives.
4. Output MUST be a valid JSON array of objects.

User:
Academic Interests: "${topic}"
Target Level: "${level}"

DATABASE LIST:
${JSON.stringify(courseText)}

Return ONLY valid JSON:
[
  {
    "title": "exact course title",
    "university": "exact university",
    "matchScore": 0-100,
    "reason": "short reason only"
  }
]
`;

  let text = "";

try {
  const result = await model.generateContent(prompt);
  text = result.response.text();
  return extractJson(text);
} catch (error) {
  console.error("Gemini API failed, using fallback:", error.message);

  // 🔥 Smart fallback using DB (already fetched courses)
  return courses.slice(0, 3).map(c => ({
    title: c.title,
    university: c.university,
    matchScore: 80,
    reason: "Recommended based on similar topic and category match"
  }));
}
};

const getAIRecommendations = async (preferences) => {
  try {
    return await getGeminiRecommendations(preferences);
  } catch (err) {
    console.error("AI ERROR:", err);
    return [];
  }
};

module.exports = { getAIRecommendations, getGeminiRecommendations };
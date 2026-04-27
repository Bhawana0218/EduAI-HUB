const fs = require('fs');
const csv = require('csv-parser');
const Course = require('../models/Course');
const redisClient = require('../config/redis');

const COURSE_CACHE_TTL_SECONDS = 60 * 10;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value) => (value || '').toString().trim();

const toStringArray = (value) => {
  const text = toText(value);
  if (!text) return [];

  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
};

const parseCsvFile = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const mapped = {
          course_id: toText(data['Unique ID'] || data.course_id),
          title: toText(data['Course Name'] || data.title),
          code: toText(data['Course Code'] || data.code),

          university: toText(data['University Name'] || data.university),
          department: toText(data['Department/School'] || data.department),
          category: toText(data['Discipline/Major'] || data.category),
          sub_category: toText(data['Specialization'] || data.sub_category),

          level: toText(data['Course Level'] || data.level),
          description: toText(data['Overview/Description'] || data.description),

          instructor: toText(data['Professor Name'] || data.instructor),
          duration_weeks: toNumber(data['Duration (Months)']),
          credits: toNumber(data.Credits),

          language: toText(data['Language of Instruction'] || data.language),
          syllabus_url: toText(data['Syllabus URL'] || data.syllabus_url),
          tags: toStringArray(data['Keywords (comma-separated)'] || data.tags),

          fees: {
            min: toNumber(data['1st Year Tuition Fee'] || data.fees_min),
            max: toNumber(data['Total Tuition Fee'] || data.fees_max),
            currency: toText(data['Tuition Fee Currency'] || data.fees_currency),
          },

          eligibility: {
            degree: toText(data['Undergraduate Degree Requirement'] || data.eligibility_degree),
            ielts: toNumber(data['Minimum IELTS Score'] || data.eligibility_ielts),
            toefl: toNumber(data['Minimum TOEFL Score'] || data.eligibility_toefl),
          },

          application_link: toText(data['Course URL'] || data.application_link),
        };

        if (mapped.title || mapped.course_id) {
          results.push(mapped);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });

const clearCoursesCache = async () => {
  try {
    if (!redisClient.isReady()) return;

    const rawClient = redisClient.getRawClient();
    if (!rawClient) return;

    const keys = await rawClient.keys('courses:*');
    if (!keys.length) return;

    await rawClient.del(keys);
  } catch (err) {
    console.warn('Course cache invalidation failed:', err.message);
  }
};

const getPagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const buildSearchFilter = (query) => {
  const keyword = toText(query.query || query.q);
  const category = toText(query.category);
  const level = toText(query.level);
  const university = toText(query.university);

  const filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
      { university: { $regex: keyword, $options: 'i' } },
      { department: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
    ];
  }

  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }

  if (level) {
    filter.level = { $regex: level, $options: 'i' };
  }

  if (university) {
    filter.university = { $regex: university, $options: 'i' };
  }

  return filter;
};

const getListCacheKey = (query, page, limit) => {
  const normalized = {
    query: toText(query.query || query.q).toLowerCase(),
    category: toText(query.category).toLowerCase(),
    level: toText(query.level).toLowerCase(),
    university: toText(query.university).toLowerCase(),
    page,
    limit,
  };

  return `courses:list:${JSON.stringify(normalized)}`;
};

exports.uploadCourses = async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({
      message: 'No file uploaded. Use form-data key "file" with a .csv file.',
    });
  }

  try {
    const parsedCourses = await parseCsvFile(filePath);

    if (!parsedCourses.length) {
      return res.status(400).json({
        message: 'CSV file is empty or headers do not match expected fields.',
      });
    }

    const operations = parsedCourses.map((course) => {
      const hasCourseId = Boolean(course.course_id);
      const fallbackFilter = {
        title: course.title || '',
        code: course.code || '',
        university: course.university || '',
      };

      return {
        updateOne: {
          filter: hasCourseId ? { course_id: course.course_id } : fallbackFilter,
          update: { $set: course },
          upsert: true,
        },
      };
    });

    const result = await Course.bulkWrite(operations, { ordered: false });
    await clearCoursesCache();

    return res.json({
      message: 'Courses uploaded successfully',
      received: parsedCourses.length,
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Course upload failed', error: err.message });
  } finally {
    if (filePath) {
      fs.promises.unlink(filePath).catch(() => {});
    }
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildSearchFilter(req.query);
    const cacheKey = getListCacheKey(req.query, page, limit);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({ ...parsed, source: 'cache' });
    }

    const [data, total] = await Promise.all([
      Course.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    const response = {
      source: 'database',
      count: data.length,
      total,
      page,
      limit,
      data,
    };

    await redisClient.setEx(cacheKey, COURSE_CACHE_TTL_SECONDS, JSON.stringify(response));
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: 'Course listing failed', error: err.message });
  }
};

exports.searchCourses = async (req, res) => {
  const keyword = toText(req.query.query || req.query.q);
  if (!keyword) {
    return res.status(400).json({ message: 'Query is required' });
  }

  req.query.query = keyword;
  return exports.listCourses(req, res);
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `courses:id:${id}`;

    // Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached),
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Store in Redis for future requests
    await redisClient.setEx(cacheKey, COURSE_CACHE_TTL_SECONDS, JSON.stringify(course));

    return res.json({
      source: 'database',
      data: course,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Course fetch failed', error: err.message });
  }
};

const formatCourse = (c) => ({
  _id: c._id,

  courseName: c.title || 'Untitled Course',
  universityName: c.university || 'Unknown University',
  overviewDescription: c.description || '',

  courseLevel: c.level || 'N/A',
  durationMonths: c.durationMonths || c.duration_weeks || 0,
  languageOfInstruction: c.language || 'English',

  courseUrl: c.url || '#',

  tuitionFeeCurrency: c.fees?.currency || '',

  fees: {
    min: c.fees?.min || 0,
    currency: c.fees?.currency || '',
  },

  internationalApplicationDeadline: c.deadline || null,
});

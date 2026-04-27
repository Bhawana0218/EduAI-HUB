const express = require('express');
const router = express.Router();


const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCourses, searchCourses, listCourses, getCourseById } = require('../controllers/courseController');
const { getRecommendations } = require('../controllers/recommendationController');

router.post('/upload', authMiddleware, upload.single('file'), uploadCourses);
router.get('/', listCourses);
router.get('/search', searchCourses);
router.get('/:id', getCourseById);
router.post('/recommendations', getRecommendations);

// GET single course by ID
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

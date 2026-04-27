const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const {
  uploadUniversities,
  searchUniversities
} = require('../controllers/universityController');

router.post('/upload', upload.single('file'), uploadUniversities);
router.get('/search', searchUniversities);

module.exports = router;

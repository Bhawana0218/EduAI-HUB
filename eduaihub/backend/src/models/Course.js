const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_id: String,
  title: String,
  code: String,

  university: String,
  department: String,
  category: String,
  sub_category: String,

  level: String,
  description: String,

  instructor: String,
  duration_weeks: Number,
  credits: Number,

  language: String,
  syllabus_url: String,

  tags: [String],

  fees: {
    min: Number,
    max: Number,
    currency: String
  },

  eligibility: {
    degree: String,
    ielts: Number,
    toefl: Number
  },

  application_link: String
}, { timestamps: true });

courseSchema.index({ course_id: 1 });
courseSchema.index({ updatedAt: -1 });
courseSchema.index({ title: 'text', category: 'text', university: 'text', department: 'text' });

module.exports = mongoose.model('Course', courseSchema);

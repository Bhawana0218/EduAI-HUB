const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    university_name: { type: String, required: true, trim: true },
    unique_code: { type: String, required: true, unique: true, trim: true },
    image_url: String,
    location: String,
    full_address: String,
    established_year: Number,
    type: String,
    partner_university: Boolean,
    description: String,
    long_description: String,
    official_website: String,
    email: String,
    contact_number: String,
    application_fee_waived: Boolean,
    rankings: {
      us_news: String,
      qs: String,
      the: String,
      arwu: String,
      our: String
    },
    fields_of_study: [String],
    program_offerings: [String],
    tuition_fees: {
      min: Number,
      max: Number,
      currency: String,
      notes: String
    },
    admission_requirements: String,
    campus_life: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);

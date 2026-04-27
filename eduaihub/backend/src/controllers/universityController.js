const fs = require('fs');
const csv = require('csv-parser');
const University = require('../models/University');
const redisClient = require('../config/redis');

const parseBoolean = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return ['yes', 'true', '1'].includes(normalized);
};

const splitCsvList = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseCsvFile = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rows.push({
          university_name: data['University Name'] || data.university_name || '',
          unique_code: data['Unique Code'] || data.unique_code || '',
          image_url: data['Image URL'] || data.image_url || '',
          location: data['Location (City, Country)'] || data.location || '',
          full_address: data['Full Address'] || data.full_address || '',
          established_year: Number(data['Established Year'] || data.established_year || 0),
          type: data.Type || data.type || '',
          partner_university: parseBoolean(data['Partner University (Yes/No)'] || data.partner_university),
          description: data.Description || data.description || '',
          long_description: data['Long Description'] || data.long_description || '',
          official_website: data['Official Website'] || data.official_website || '',
          email: data.Email || data.email || '',
          contact_number: data['Contact Number'] || data.contact_number || '',
          application_fee_waived: parseBoolean(
            data['Application Fee Waived (Yes/No)'] || data.application_fee_waived
          ),
          rankings: {
            us_news: data['US News & World Report'] || data.rankings_us_news || '',
            qs: data['QS Ranking'] || data.rankings_qs || '',
            the: data['THE (Times Higher Education)'] || data.rankings_the || '',
            arwu: data['ARWU (Shanghai Ranking)'] || data.rankings_arwu || '',
            our: data['Our Ranking'] || data.rankings_our || ''
          },
          fields_of_study: splitCsvList(data['Fields of Study (comma-separated)'] || data.fields_of_study),
          program_offerings: splitCsvList(
            data['Program Offerings (IDs) (comma-separated IDs)'] || data.program_offerings
          ),
          tuition_fees: {
            min: Number(data['Tuition Fees Min'] || data.tuition_fees_min || 0),
            max: Number(data['Tuition Fees Max'] || data.tuition_fees_max || 0),
            currency: data['Tuition Fees Currency'] || data.tuition_fees_currency || '',
            notes: data['Tuition Fees Notes'] || data.tuition_fees_notes || ''
          },
          admission_requirements: data['Admission Requirements (use "" for multiline)'] || data.admission_requirements || '',
          campus_life: data['Campus Life (use "" for multiline)'] || data.campus_life || ''
        });
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });

exports.uploadUniversities = async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({
      message: 'No file uploaded. Use form-data key "file" with a .csv file.'
    });
  }

  try {
    const universities = await parseCsvFile(filePath);
    const filtered = universities.filter((row) => row.university_name && row.unique_code);

    if (!filtered.length) {
      return res.status(400).json({
        message: 'CSV file is empty or required headers are missing.'
      });
    }

    await University.insertMany(filtered, { ordered: false });

    return res.json({
      message: 'Universities uploaded successfully',
      count: filtered.length
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (filePath) {
      fs.promises.unlink(filePath).catch(() => {});
    }
  }
};

exports.searchUniversities = async (req, res) => {
  try {
    const query = (req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const cacheKey = `universities:${query.toLowerCase()}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    const universities = await University.find({
      $or: [
        { university_name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { fields_of_study: { $in: [new RegExp(query, 'i')] } }
      ]
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(universities));

    return res.json({
      source: 'database',
      count: universities.length,
      data: universities
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

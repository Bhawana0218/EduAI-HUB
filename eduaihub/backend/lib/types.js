// export const Course = {
//   courseName: string,
//   universityName: string,
//   overviewDescription?: string,
//   courseLevel?: string,
//   durationMonths?: number,
//   languageOfInstruction?: string,
//   courseUrl: string,

//   tuitionFeeCurrency?: string,

//   // ✅ ADD THIS
//   fees?: {
//     min?: number,
//     currency?: string,
//   },

//   internationalApplicationDeadline?: string
// };



// lib/types.js

/**
 * @typedef {Object} Course
 * @property {string} _id
 * @property {string} course_id
 * @property {string} title
 * @property {string} code
 * @property {string} university
 * @property {string} department
 * @property {string} category
 * @property {string} [sub_category]
 * @property {string} level
 * @property {string} description
 * @property {string} instructor
 * @property {number} duration_weeks
 * @property {number} credits
 * @property {string} language
 * @property {string[]} tags
 * @property {{ min: number, max: number, currency: string }} fees
 * @property {{ degree: string, ielts?: number, toefl?: number }} eligibility
 * @property {string} [syllabus_url]
 * @property {string} [application_link]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} title
 * @property {string} university
 * @property {number} matchScore
 * @property {string} reason
 */

module.exports = {};


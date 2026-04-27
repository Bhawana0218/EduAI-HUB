exports.transformCourse = (row) => {
  return {
    course_id: row[0],
    title: row[1],
    code: row[2],

    university: row[4],
    department: row[5],
    category: row[6],
    sub_category: row[7],

    level: row[8],
    description: row[9],

    instructor: row[24],

    duration_weeks: Number(row[16]),
    credits: Number(row[15]),

    language: row[18],
    syllabus_url: row[19],

    tags: row[20]?.split(','),

    fees: {
      min: Number(row[29]),
      max: Number(row[30]),
      currency: row[31]
    },

    eligibility: {
      degree: row[39],
      ielts: Number(row[40]),
      toefl: Number(row[41])
    },

    application_link: row[row.length - 1]
  };
};
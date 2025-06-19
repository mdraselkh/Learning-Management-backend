import pool from "../config/db.js";

export const getDashboardStatsModel = async () => {
  const revenueRes = await pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'
  `);

  const usersRes = await pool.query(`SELECT COUNT(*) AS total FROM users`);
  const instructorsRes = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'instructor'`
  );
  const studentsRes = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'student'`
  );
  const coursesRes = await pool.query(`SELECT COUNT(*) AS total FROM courses`);
  const enrollmentsRes = await pool.query(
    `SELECT COUNT(*) AS total FROM enrollments`
  );

  return {
    totalRevenue: parseFloat(revenueRes.rows[0].total),
    totalUsers: parseInt(usersRes.rows[0].total),
    totalInstructors: parseInt(instructorsRes.rows[0].total),
    totalStudents: parseInt(studentsRes.rows[0].total),
    totalCourses: parseInt(coursesRes.rows[0].total),
    totalEnrollments: parseInt(enrollmentsRes.rows[0].total),
  };
};

export const getRevenueByCategoryModel = async (filter) => {
  let dateCondition = "";
  if (filter === "7d") {
    dateCondition = "AND p.created_at >= NOW() - INTERVAL '7 days'";
  } else if (filter === "30d") {
    dateCondition = "AND p.created_at >= NOW() - INTERVAL '30 days'";
  } else if (filter === "year") {
    dateCondition =
      "AND DATE_PART('year', p.created_at) = DATE_PART('year', CURRENT_DATE)";
  }

  const USD_TO_BDT = 110;

  const query = `
    SELECT 
      cat.category_title AS category,
      COALESCE(SUM(p.amount * ${USD_TO_BDT}), 0) AS revenue
    FROM 
      payments p
    JOIN 
      courses c ON p.course_id = c.id
    JOIN 
      categories cat ON c.category_id = cat.id
    WHERE 
      p.status = 'completed'
      ${dateCondition}
    GROUP BY 
      cat.category_title
    ORDER BY 
      revenue DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching revenue by category:", error.message);
    throw error;
  }
};


export const getInstructorDashboardStatsModel = async (InstructorId) => {
  console.log(InstructorId);
  try {
    // 1️⃣ Total Earnings (sum of completed payments for instructor's courses)
    const revenueRes = await pool.query(
      `
      SELECT COALESCE(SUM(p.amount), 0) AS total
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      JOIN course_instructors ci ON c.id = ci.course_id
      WHERE p.status = 'completed' AND ci.instructor_id = $1
      `,
      [InstructorId]
    );

    // 2️⃣ Total Courses by Instructor
    const coursesRes = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM course_instructors
      WHERE instructor_id = $1
      `,
      [InstructorId]
    );

    // 3️⃣ Total Unique Students enrolled in Instructor’s courses
    const studentsRes = await pool.query(
      `
      SELECT COUNT(DISTINCT e.user_id) AS total
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN course_instructors ci ON c.id = ci.course_id
      WHERE ci.instructor_id = $1
      `,
      [InstructorId]
    );

    // 4️⃣ Average Rating from reviews
    const ratingRes = await pool.query(
      `
      SELECT COALESCE(AVG(r.rating), 0) AS avg
      FROM reviews r
      JOIN courses c ON r.course_id = c.id
      JOIN course_instructors ci ON c.id = ci.course_id
      WHERE ci.instructor_id = $1
      `,
      [InstructorId]
    );

    // 5️⃣ Total Lessons (sections) from instructor’s courses
    const lessonsRes = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM sections s
      WHERE s.course_id IN (
        SELECT ci.course_id
        FROM course_instructors ci
        WHERE ci.instructor_id = $1
      )
      `,
      [InstructorId]
    );

    return {
      totalEarnings: parseFloat(revenueRes.rows[0].total),
      totalCourses: parseInt(coursesRes.rows[0].total),
      totalStudents: parseInt(studentsRes.rows[0].total),
      avgRating: parseFloat(ratingRes.rows[0].avg).toFixed(1),
      totalLessons: parseInt(lessonsRes.rows[0].total),
    };
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    throw err;
  }
};


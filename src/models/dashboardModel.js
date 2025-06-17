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

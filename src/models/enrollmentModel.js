import pool from "../config/db.js";

// Add enrollment
export const addEnrollment = async (
  userId,
  courseId,
  paymentId,
  enrollmentStatus
) => {
  const query = `
    INSERT INTO enrollments (user_id, course_id, payment_id, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, courseId, paymentId, enrollmentStatus];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getEnrollmentByUserIdAndCourseId = async (userId, courseId) => {
  const query = `
      SELECT * FROM enrollments
      WHERE user_id = $1 AND course_id = $2
    `;
  const values = [userId, courseId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the first row if exists, otherwise undefined
  } catch (error) {
    console.error("Error checking enrollment:", error);
    throw new Error("Error checking enrollment");
  }
};

// Get enrollments for a user
export const getEnrollmentsByUser = async (userId) => {
    const query = `
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        e.payment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        c.id AS course_id,
        c.title AS course_title,
        c.price AS course_price,
        c.description AS course_description,
        p.id AS payment_id,
        p.amount AS payment_amount,
        p.payment_method,
        p.payment_date,
        p.status AS payment_status,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.city AS user_city,
        u.address AS user_address
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN payments p ON e.payment_id = p.id
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = $1;
    `;
  
    const result = await pool.query(query, [userId]);
  
    // Return data with structured enrollment, payment, and user
    return result.rows.map(row => ({
      enrollment: {
        id: row.enrollment_id,
        course_id: row.course_id,
        payment_id: row.payment_id,
        enrollment_date: row.enrollment_date,
        status: row.enrollment_status,
      },
      payment: {
        id: row.payment_id,
        amount: row.payment_amount,
        method: row.payment_method,
        date: row.payment_date,
        status: row.payment_status,
      },
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        phone: row.user_phone,
        city: row.user_city,
        address: row.user_address,
      },
      course: {
        id: row.course_id,
        title: row.course_title,
        price: row.course_price,
        description: row.course_description,
      },
    }));
  };
  

export const getAllEnrollments = async () => {
    const query = `
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        e.payment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        c.id AS course_id,
        c.title AS course_title,
        c.price AS course_price,
        c.description AS course_description,
        p.id AS payment_id,
        p.amount AS payment_amount,
        p.payment_method,
        p.payment_date,
        p.status AS payment_status,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.city AS user_city,
        u.address AS user_address,
        u.image_url AS user_image
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN payments p ON e.payment_id = p.id
      JOIN users u ON e.user_id = u.id;
    `;
    const result = await pool.query(query);
     return result.rows.map(row => ({
      enrollment: {
        id: row.enrollment_id,
        course_id: row.course_id,
        payment_id: row.payment_id,
        enrollment_date: row.enrollment_date,
        status: row.enrollment_status,
      },
      payment: {
        id: row.payment_id,
        amount: row.payment_amount,
        method: row.payment_method,
        date: row.payment_date,
        status: row.payment_status,
      },
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        phone: row.user_phone,
        city: row.user_city,
        address: row.user_address,
        image_url: row.user_image,
      },
      course: {
        id: row.course_id,
        title: row.course_title,
        price: row.course_price,
        description: row.course_description,
      },
    }));
  };
  

// // Update enrollment status
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  const query = `
    UPDATE enrollments
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, enrollmentId]);
  return result.rows[0];
};

// // Delete enrollment
export const deleteEnrollment = async (enrollmentId) => {
  const query = `DELETE FROM enrollments WHERE id = $1;`;
  await pool.query(query, [enrollmentId]);
};

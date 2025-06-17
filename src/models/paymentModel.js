import pool from "../config/db.js";

// Add payment
export const addPayment = async (
  userId,
  courseId,
  amount,
  paymentMethod,
  paymentStatus
) => {
  const query = `
    INSERT INTO payments (user_id, course_id, amount, payment_method, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [userId, courseId, amount, paymentMethod, paymentStatus];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get payment by ID
export const getAllPayments = async () => {
  const query = `
    SELECT 
      payments.id AS payment_id,
      payments.amount,
      payments.status,
      payments.payment_date,
      
      users.id AS user_id,
      users.name AS user_name,
      users.image_url,
      users.email,

      courses.id AS course_id,
      courses.title AS course_title

    FROM payments
    JOIN users ON payments.user_id = users.id
    JOIN courses ON payments.course_id = courses.id
    ORDER BY payments.payment_date DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// // Get payments for a user
export const getPaymentsByUser = async (userId) => {
  const query = `
    SELECT * FROM payments
    WHERE user_id = $1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const updatePaymentStatus = async (paymentId, status) => {
  console.log(paymentId, status);
  const query = `
      UPDATE payments
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
  const result = await pool.query(query, [status, paymentId]);
  return result.rows[0];
};

export const getPaymentsByStudentId = async (studentId) => {
  const query = `
    SELECT p.*,u.name,u.email,c.title,c.thumbnail,ct.category_title FROM payments p
    LEFT JOIN courses c ON p.course_id = c.id 
    LEFT JOIN categories ct ON c.category_id = ct.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE user_id = $1
    ORDER BY p.payment_date DESC;
  `;
  const result = await pool.query(query, [studentId]);
  return result.rows;
};

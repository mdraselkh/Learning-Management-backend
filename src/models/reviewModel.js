import pool from "../config/db.js";

// Add a review
export const addReview = async (userId, courseId, rating, comment) => {
  const query = `
    INSERT INTO reviews (user_id, course_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, courseId, rating, comment];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get reviews for a course
export const getReviewsByCourse = async (courseId) => {
  const query = `
    SELECT  r.id AS review_id,
    r.rating,
    r.comment,
    r.created_at, u.*
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.course_id = $1;
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
};

export const getTopReviews = async () => {
  const query = `
      SELECT 
        r.id AS review_id,
        r.rating,
        r.comment,
        r.created_at,
        u.*,
        c.title AS course_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN courses c ON r.course_id = c.id
      ORDER BY r.rating DESC, r.created_at DESC
      LIMIT 5;
    `;

  const result = await pool.query(query);
  return result.rows;
};

// Update a review
export const updateReview = async (reviewId, rating, comment) => {
  const query = `
    UPDATE reviews
    SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;
  const result = await pool.query(query, [rating, comment, reviewId]);
  return result.rows[0];
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const query = `DELETE FROM reviews WHERE id = $1;`;
  await pool.query(query, [reviewId]);
};

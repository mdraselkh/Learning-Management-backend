import pool from "../config/db.js";

const createReviewTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Review table created successfully");
  } catch (error) {
    console.error("Error creating review table:", error);
  }
};

export default createReviewTable;


import pool from "../config/db.js";

const createEnrollmentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(255),
    payment_id INT REFERENCES payments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
    );
  `;

  try {
    await pool.query(query);
    console.log("Enrollment table created successfully");
  } catch (error) {
    console.error("Error creating enrollment table:", error);
  }
};

export default createEnrollmentTable;

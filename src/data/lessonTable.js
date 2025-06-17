import pool from "../config/db.js";

const createLessonTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS lesson (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL, 
      subtitle VARCHAR(255) DEFAULT NULL, 
      description TEXT NOT NULL, 
      objectives JSONB DEFAULT '[]', 
      lesson_summary TEXT NOT NULL, 
      thumbnail VARCHAR(255) DEFAULT NULL,
      status VARCHAR(20) CHECK (status IN ('active', 'deactive')) NOT NULL,
      video_url VARCHAR(255) NOT NULL,
      duration VARCHAR(50) DEFAULT NULL, 
      type VARCHAR(50) DEFAULT 'video', 
      position INTEGER NOT NULL DEFAULT 1,
      is_preview BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP 
    );
  `;

  try {
    await pool.query(query);
    console.log("Lesson table created successfully");
  } catch (error) {
    console.error("Error creating lesson table:", error);
  }
};

export default createLessonTable;

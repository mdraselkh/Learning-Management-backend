import pool from "../config/db.js";

// Courses Table
const createCourseTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      objectives JSONB DEFAULT '[]'::jsonb, -- Store objectives as an array of JSON
      tags JSONB DEFAULT '[]'::jsonb, -- Store tags as an array of strings
      target_audience TEXT DEFAULT NULL,
      category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      price FLOAT DEFAULT NULL,
      course_label VARCHAR(20) CHECK (course_label IN ('beginner', 'intermediate', 'advanced')),
      language VARCHAR(20) CHECK (language IN ('english', 'bangla')),
      total_lesson VARCHAR(20) DEFAULT NULL,
      lesson_duration VARCHAR(50) DEFAULT NULL,
      time_span VARCHAR(50) DEFAULT NULL,
      thumbnail VARCHAR(255) DEFAULT NULL,
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Courses table created successfully");
  } catch (error) {
    console.error("Error creating courses table:", error.message);
  }
};

// Course Instructors Table
const createCourseInstructorsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS course_instructors (
      id SERIAL PRIMARY KEY,
      course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      instructor_id INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Course instructors table created successfully");
  } catch (error) {
    console.error("Error creating course_instructors table:", error.message);
  }
};

// Sections Table
const createSectionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      video_url TEXT DEFAULT NULL,
      position INT DEFAULT NULL,
      is_published BOOLEAN DEFAULT false,
      is_free BOOLEAN DEFAULT false,
      course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Sections table created successfully");
  } catch (error) {
    console.error("Error creating sections table:", error.message);
  }
};

// Progress Table
const createProgressTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, section_id)
    );
  `;

  try {
    await pool.query(query);
    console.log("Progress table created successfully");
  } catch (error) {
    console.error("Error creating progress table:", error.message);
  }
};

// Create All Tables
const createTables = async () => {
  await createCourseTable();
  await createCourseInstructorsTable();
  await createSectionTable();
  await createProgressTable();
};

export default createTables;

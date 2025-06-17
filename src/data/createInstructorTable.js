import pool from '../config/db.js';

const createInstructorTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS instructor (
      id SERIAL PRIMARY KEY,
      fname VARCHAR(100) NOT NULL,
      lname VARCHAR(100) NOT NULL,
      phone VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      city VARCHAR(100) NOT NULL,
      address VARCHAR(100) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      description VARCHAR(555),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Instructor table created successfully');
  } catch (error) {
    console.error('Error creating instructor table:', error);
  }
};

export default createInstructorTable;

import pool from "../config/db.js";

const createUserTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(100) UNIQUE,
        city VARCHAR(100),
        address VARCHAR(100),
        description TEXT,
        image_url VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        is_email_verified BOOLEAN DEFAULT false,
        session_token TEXT,
        email_verification_token TEXT,
        status VARCHAR(255) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

  try {
    await pool.query(query);
    console.log("User table created successfully");
  } catch (error) {
    console.error("Error creating user table:", error);
  }
};

export default createUserTable;

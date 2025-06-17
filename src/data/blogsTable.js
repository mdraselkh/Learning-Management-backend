import pool from "../config/db.js";

const createBlogsTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(255) NOT NULL, 
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Blogs table created successfully");
  } catch (error) {
    console.error("Error creating blogs table:", error);
  }
};

export default createBlogsTable;

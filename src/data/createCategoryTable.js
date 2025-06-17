import pool from "../config/db.js";

const createCategoryTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    category_title VARCHAR(255) NOT NULL,
    subcategory JSONB DEFAULT '[]', 
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Category table created successfully");
  } catch (error) {
    console.error("Error creating category table:", error);
  }
};

export default createCategoryTable;

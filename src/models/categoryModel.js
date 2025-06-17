import pool from '../config/db.js';

// Function to create a new category (parent or subcategory)
export const createCategory = async (data) => {
  const { category_title, subcategory, description } = data;

  try {
    const query = `
      INSERT INTO categories (category_title, subcategory, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [category_title, JSON.stringify(subcategory), description];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Function to fetch all categories and subcategories
export const getCategories = async () => {
  try {
    const query = "SELECT * FROM categories;";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Function to fetch a single category by ID
export const getCategoryById = async (id) => {
  try {
    const query = "SELECT * FROM categories WHERE id = $1;";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};

// Function to fetch subcategories based on the parent category
export const getSubcategoriesByCategory = async (categoryTitle) => {
  try {
    const query = "SELECT * FROM categories WHERE category_title = $1 AND subcategory IS NOT NULL;";
    const result = await pool.query(query, [categoryTitle]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

// Function to update a category or subcategory by ID
export const updateCategoryById = async (id, data) => {
  const { category_title, subcategory, description } = data;

  try {
    const query = `
      UPDATE categories
      SET category_title = $1, subcategory = $2, description = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [category_title, JSON.stringify(subcategory), description, id];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Function to delete a category by ID
export const deleteCategoryById = async (id) => {
  try {
    const query = "DELETE FROM categories WHERE id = $1 RETURNING *;";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};


// Function to fetch all categories with subcategories and course counts
export const getCategoriesWithCourseCount = async () => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.category_title AS title, 
        c.subcategory, 
        COUNT(cr.id) AS course_count
      FROM 
        categories c
      LEFT JOIN 
        courses cr
      ON 
        c.id = cr.category_id
      GROUP BY 
        c.id;
    `;

    const result = await pool.query(query);

    // Format the result to include subcategories and course count
    const formattedCategories = result.rows.map((category) => ({
      id: category.id,
      categoryTitle: category.title,
      courseCount: `${category.course_count} Courses`,
      subcategories: category.subcategory, // Assuming JSONB array is stored in subcategory
    }));

    return formattedCategories;
  } catch (error) {
    console.error("Error fetching categories with subcategories:", error.message);
    throw error;
  }
};


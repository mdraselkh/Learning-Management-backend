import pool from "../config/db.js";

// Create a new blog
export const createBlog = async (blogData) => {
  const { title, content, author_id, category, image_url, status } = blogData;

  const query = `
    INSERT INTO blogs (title, content, author_id, category, image_url, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const result = await pool.query(query, [title, content, author_id, category, image_url,status]);
  return result.rows[0];
};

// Get all blogs
export const getAllBlogs = async () => {
  const query = `
    SELECT 
      b.*,
      u.name AS author_name
    FROM blogs b
    JOIN users u ON b.author_id = u.id
    ORDER BY b.created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Get a blog by ID
export const getBlogById = async (id) => {
  const query = `
    SELECT 
      b.*,
      u.name AS author_name,
      u.image_url AS author_img
    FROM blogs b
    JOIN users u ON b.author_id = u.id
    WHERE b.id = $1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Update a blog
export const updateBlog = async (id, updates) => {
  const keys = Object.keys(updates).filter((key) => updates[key] !== undefined);
  const values = keys.map((key) => updates[key]);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE blogs
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete a blog
export const deleteBlog = async (id) => {
  const query = `
    DELETE FROM blogs
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

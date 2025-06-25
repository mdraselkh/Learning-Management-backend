import pool from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Function to register a new user
const createUser = async (data) => {
  try {
    const { name, email, password, phone,description, city, address, role, image_url } =
      data;

    // Hash the password before inserting into the database
    if (!password) {
      throw new Error("Password is required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    // console.log('Hashed Password:', hashedPassword);

    const query = `
    INSERT INTO users (name, email, password, phone, description, city, address, role, image_url,email_verification_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

    const values = [
      name,
      email,
      hashedPassword,
      phone,
      description,
      city,
      address,
      role,
      image_url,
      verificationToken
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Throw the error to handle it in the calling function
  }
};

export const findOrCreateUser = async ({ name, email, image_url, provider }) => {
  const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (existingUser.rows.length > 0) return existingUser.rows[0];

  const newUser = await pool.query(
    `INSERT INTO users (name, email, image_url, role, is_email_verified, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, email, image_url, "student", true, "active"]
  );

  return newUser.rows[0];
};

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(result);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error; // Throw the error to handle it in the calling function
  }
};

export const verifyEmailToken = async (userId, token) => {
  const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  const user = userResult.rows[0];
  if (!user || user.email_verification_token !== token) return null;

  await pool.query(
    "UPDATE users SET is_email_verified = true, email_verification_token = NULL WHERE id = $1",
    [userId]
  );

  return true;
};

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0];
};

const updateUser = async (id, data) => {
  // Dynamically build query based on provided fields
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      // Only update non-null/defined fields
      fields.push(`${key}=$${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No valid fields provided to update");
  }

  // Add user ID for the WHERE clause
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id=$${index}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error(`User with ID ${id} not found`);
  }

  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [
    id,
  ]);
  return result.rows[0];
};

export const markUserAsActive = async (userId) => {
  try {
    const query = `UPDATE users SET status = 'active' WHERE id = $1`;
    await pool.query(query, [userId]);
    console.log(`User with ID ${userId} is now active.`);
  } catch (error) {
    console.error("Error marking user as active:", error);
  }
};

export const markUserAsInactive = async (userId) => {
  try {
    const query = `UPDATE users SET status = 'inactive' WHERE id = $1`;
    await pool.query(query, [userId]);
    console.log(`User with ID ${userId} is now inactive.`);
  } catch (error) {
    console.error("Error marking user as inactive:", error);
  }
};

export const blockUser = async (userId) => {
  try {
    const query = `UPDATE users SET status = 'blocked' WHERE id = $1`;
    await pool.query(query, [userId]);
    console.log(`User with ID ${userId} has been blocked.`);
  } catch (error) {
    console.error("Error blocking user:", error);
  }
};


export {
  createUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; // Use named exports

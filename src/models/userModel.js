import pool from "../config/db.js";
import bcrypt from 'bcrypt'; 

// Function to register a new user
const createUser = async (name, email, password, role) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Throw the error to handle it in the calling function
  }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error; // Throw the error to handle it in the calling function
  }
};

const getAllUsers = async () => {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    return result.rows;
  };

const getUserById=async(id)=>{
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1',[id]);
    return result.rows[0];
}
const updateUser=async(id,name,email,password)=>{
    const result = await pool.query('UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4 RETURNING *',[name,email,password,id]);
    return result.rows[0];
}
const deleteUser=async(id)=>{
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}

export { createUser, findUserByEmail, getAllUsers, getUserById,updateUser, deleteUser }; // Use named exports

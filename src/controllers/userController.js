import jwt from "jsonwebtoken";
import config from "../config/config.js";
import bcrypt from "bcrypt";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUser,
} from "../models/userModel.js";
import { userSchema } from "../middlewares/validation/userSchema.js";
import { z } from "zod";

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const registerUser = async (req, res) => {
  try {
    const validationData = userSchema.parse(req.body);
    const { name, email, password, role = "student" } = validationData;
    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create a new user
    const user = await createUser(name, email, password, role);

    // Generate a token for the new user
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logs in a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const loginUser = async (req, res) => {
  try {
    const validateData = userSchema.parse(req.body);
    const { email, password } = validateData;
    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a token for the logged-in user
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation errors",
        errors: error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all registered users
export const getAllRegisteredUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({ message: "AllUsers fetched successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUserByIdHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    res.status(200).json({ message: `user ${id} fetched successfully`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};
export const updateUserHandler = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await updateUser(req.params.id, name, email, password);
    res.status(200).json({ message: `user ${id} updated successfully`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};
export const deleteUserHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await deleteUser(id);
    res.status(200).json({ message: `user ${id} deleted successfully`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

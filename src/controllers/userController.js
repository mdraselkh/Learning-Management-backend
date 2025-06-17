import jwt from "jsonwebtoken";
import config from "../config/config.js";
import bcrypt from "bcrypt";
import {
  blockUser,
  createUser,
  deleteUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  markUserAsActive,
  markUserAsInactive,
  updateUser,
} from "../models/userModel.js";
import {
  userSchemaLogin,
  userSchemaRegister,
} from "../middlewares/validation/userSchema.js";
import { z } from "zod";

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const validationData = userSchemaRegister.parse(req.body);
    const { name, email, password, role, city, address, phone, description } =
      validationData;

    const data = {
      name,
      email,
      password,
      role: role,
      city: city || null,
      address: address || null,
      description: description || null,
      phone: phone || null,
      image_url: req.file ? req.file.path : null,
    };

    console.log(data);

    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create a new user
    const user = await createUser(data);

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
    const validateData = userSchemaLogin.parse(req.body);
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

    await markUserAsActive(user.id);

    // Generate a token for the logged-in user
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        image_url: user.image_url,
      },
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
  try {
    // Validate input using schema
    // const validationData = req.body;
    console.log(req.body);
    const {id}= req.params;

    // // Destructure validated data
    // const { name, email, password, role, city, address, phone } = validationData;

    // Add image_url if a file is uploaded
    const image_url = req.file ? req.file.path : null;

    const data = {
      ...req.body,
      image_url,
    };

    // Update the user
    const user = await updateUser(id, data);

    // Send response
    res.status(200).json({ message: `User ${req.params.id} updated successfully`, user });
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
    console.error("Error updating in user:", error);
    res.status(500).json({ message: "Internal server error" });
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

export const makeUserInactive=async(req,res)=>{
  const { id } = req.params;
  try {
    await markUserAsInactive(id);
    res.status(200).json({ message: "User logged out and marked as inactive." });
  } catch (error) {
    res.status(500).json({ error: "Error marking user as inactive." });
  }
}
export const makeUserBlocked=async(req,res)=>{
  const { id } = req.params;
  try {
    await blockUser(id);
    res.status(200).json({ message: "User blocked successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error blocking user." });
  }
}


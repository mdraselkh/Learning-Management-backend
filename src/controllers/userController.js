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
  verifyEmailToken,
} from "../models/userModel.js";
import {
  userSchemaLogin,
  userSchemaRegister,
} from "../middlewares/validation/userSchema.js";
import { z } from "zod";
import sendEmail from "../utils/sendEmail.js";
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

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
    // const verifyUrl = `http://localhost:3000/verify-email?token=${user.email_verification_token}&userId=${user.id}`;
    const verifyUrl = `https://learning-management-frontend.vercel.app/verify-email?token=${user.email_verification_token}&userId=${user.id}`;

    const emailHTML = `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
    <h2 style="text-align: center; color: #2c3e50;">Welcome to <span style="color: #f59e0b;">LearnCraft LMS</span> 🎓</h2>
    
    <p style="font-size: 16px; color: #333;">
      Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Verify Email
      </a>
    </div>

    <p style="font-size: 14px; color: #555;">
      If you did not create an account on LearnCraft LMS, you can safely ignore this email.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />

    <p style="font-size: 12px; color: #999; text-align: center;">
      &copy; ${new Date().getFullYear()} LearnCraft LMS. All rights reserved.
    </p>
  </div>
`;

    await sendEmail(user.email, "Verify your email", emailHTML);

    res.status(201).json({
      message: "Signup successful! Please check your email to verify.",
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

export const verifyEmail = async (req, res) => {
  const { token, userId } = req.query;
  if (!token || !userId) {
    return res
      .status(400)
      .json({ message: "Invalid or missing verification info." });
  }

  try {
    const result = await verifyEmailToken(userId, token);
    if (!result)
      return res.status(400).json({ message: "Invalid or expired token." });

    res.status(200).json({
      message: "Email verified successfully! Redirecting to login...",
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Verification failed." });
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

    if (!user.is_email_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    await markUserAsActive(user.id);

    const sessionId = uuidv4();

    // Generate a token for the logged-in user
    const token = jwt.sign(
      {
        userId: user.id,
        sessionId: sessionId,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        image_url: user.image_url,
      },
      config.jwtSecret,
      { expiresIn: "1d" }
    );

    await pool.query("UPDATE users SET session_token = $1 WHERE id = $2", [
      sessionId,
      user.id,
    ]);

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

// export const getProfileHandler = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decoded);
//     const id = decoded.userId;
//     console.log(id);

//     const user = await getUserById(id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const safeUser = {
//       userId: user.id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: user.role,
//       status: user.status,
//       address: user.address,
//       city: user.city,
//       image_url: user.image_url,
//       description: user.description,
//     };

//     res.status(200).json({
//       message: `User ${id} fetched successfully`,
//       user: safeUser,
//     });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Token expired" });
//     }
//     console.error("getProfileHandler error:", error);
//     res.status(500).json({ message: "Error fetching user" });
//   }
// };

export const getProfileHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const id = decoded.userId;
    const { userId, sessionId } = decoded;

    // 1️⃣ Get session_token from DB
    const result = await pool.query(
      "SELECT session_token FROM users WHERE id = $1",
      [userId]
    );

    const dbSessionToken = result.rows[0]?.session_token;

    console.log(dbSessionToken);

    // 2️⃣ Check if token matches DB session_token
    if (sessionId !== dbSessionToken) {
      return res.status(403).json({
        message:
          "Session invalid or expired. You may have logged in elsewhere.",
      });
    }

    // 3️⃣ Fetch the user data
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Return safe user
    const safeUser = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      city: user.city,
      image_url: user.image_url,
      description: user.description,
    };

    res.status(200).json({
      message: `User ${userId} fetched successfully`,
      user: safeUser,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("getProfileHandler error:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUserHandler = async (req, res) => {
  try {
    // Validate input using schema
    // const validationData = req.body;
    console.log(req.body);
    const { id } = req.params;

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

    const safeUser = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      city: user.city,
      image_url: user.image_url,
      description: user.description,
    };

    // Send response
    res.status(200).json({
      message: `User ${req.params.id} updated successfully`,
      safeUser,
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

export const makeUserInactive = async (req, res) => {
  const { id } = req.params;
  try {
    await markUserAsInactive(id);
    res
      .status(200)
      .json({ message: "User logged out and marked as inactive." });
  } catch (error) {
    res.status(500).json({ error: "Error marking user as inactive." });
  }
};
export const makeUserBlocked = async (req, res) => {
  const { id } = req.params;
  try {
    await blockUser(id);
    res.status(200).json({ message: "User blocked successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error blocking user." });
  }
};

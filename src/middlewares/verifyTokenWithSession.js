import pool from "../config/db.js";
import jwt from "jsonwebtoken";

export const verifyTokenWithSession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, sessionId } = decoded;

    const result = await pool.query(
      "SELECT session_token FROM users WHERE id = $1",
      [userId]
    );

    const dbSessionToken = result.rows[0]?.session_token;
    if (sessionId !== dbSessionToken) {
      return res.status(403).json({ message: "Session expired" });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Session check error", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

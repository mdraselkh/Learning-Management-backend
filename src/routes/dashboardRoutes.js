import express from "express";
import {
  getDashboardStatsController,
  getInstructorDashboardStatsController,
  getRevenueByCategory,
} from "../controllers/dashboardController.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";

const router = express.Router();

// Get all blogs
router.get(
  "/dashboard-stats",
  verifyTokenWithSession,
  getDashboardStatsController
);
router.get(
  "/instructor-dashboard-stats/:InstructorId",
  verifyTokenWithSession,
  getInstructorDashboardStatsController
);
router.get("/revenue-by-cat", verifyTokenWithSession, getRevenueByCategory);

export default router;

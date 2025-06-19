import express from "express";
import { getDashboardStatsController, getInstructorDashboardStatsController, getRevenueByCategory } from "../controllers/dashboardController.js";


const router = express.Router();

// Get all blogs
router.get("/dashboard-stats", getDashboardStatsController);
router.get("/instructor-dashboard-stats/:InstructorId", getInstructorDashboardStatsController);
router.get("/revenue-by-cat", getRevenueByCategory);

export default router;

import express from "express";
import { getDashboardStatsController, getRevenueByCategory } from "../controllers/dashboardController.js";

const router = express.Router();

// Get all blogs
router.get("/dashboard-stats", getDashboardStatsController);
router.get("/revenue-by-cat", getRevenueByCategory);

export default router;

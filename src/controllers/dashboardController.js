import {
  getDashboardStatsModel,
  getRevenueByCategoryModel,
} from "../models/dashboardModel.js";

export const getDashboardStatsController = async (req, res) => {
  try {
    const stats = await getDashboardStatsModel();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRevenueByCategory = async (req, res) => {
  const { filter } = req.query;
  try {
    const data = await getRevenueByCategoryModel(filter);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

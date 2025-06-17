import express from "express";
import {
  handleAddReview,
  handleGetReviewsByCourse,
  handleUpdateReview,
  handleDeleteReview,
  handleGetTopReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Add a review
router.post("/addreview", handleAddReview);

// Get reviews for a course
router.get("/getReviewByCourse/:courseId", handleGetReviewsByCourse);

router.get("/getTopReviews", handleGetTopReviews);

// Update a review
router.patch("/updateReview/:id", handleUpdateReview);

// Delete a review
router.delete("/deleteReview/:id", handleDeleteReview);

export default router;

import express from "express";
import {
  handleAddReview,
  handleGetReviewsByCourse,
  handleUpdateReview,
  handleDeleteReview,
  handleGetTopReviews,
} from "../controllers/reviewController.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";

const router = express.Router();

// Add a review
router.post("/addreview", verifyTokenWithSession, handleAddReview);

// Get reviews for a course
router.get("/getReviewByCourse/:courseId", handleGetReviewsByCourse);

router.get("/getTopReviews", handleGetTopReviews);

// Update a review
router.patch("/updateReview/:id", verifyTokenWithSession, handleUpdateReview);

// Delete a review
router.delete("/deleteReview/:id", verifyTokenWithSession, handleDeleteReview);

export default router;

import {
    addReview,
    getReviewsByCourse,
    updateReview,
    deleteReview,
    getTopReviews,
  } from "../models/reviewModel.js";
  
  // Add a review
  export const handleAddReview = async (req, res) => {
    const { userId, courseId, rating, comment } = req.body;
  
    try {
      const review = await addReview(userId, courseId, rating, comment);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  // Get reviews for a course
  export const handleGetReviewsByCourse = async (req, res) => {
    const { courseId } = req.params;
  
    try {
      const reviews = await getReviewsByCourse(courseId);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

  export const handleGetTopReviews = async (req, res) => {
    try {
      const topReviews = await getTopReviews();
      res.status(200).json({ success: true, data: topReviews });
    } catch (error) {
      console.error("Error fetching top reviews:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // Update a review
  export const handleUpdateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
  
    try {
      const updatedReview = await updateReview(id, rating, comment);
      res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  // Delete a review
  export const handleDeleteReview = async (req, res) => {
    const { id } = req.params;
  
    try {
      await deleteReview(id);
      res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
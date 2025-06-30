import express from "express";
import {
  handleCreateCourse,
  handleGetCourses,
  handleGetCourseById,
  handleDeleteCourseById,
  publishCourseController,
  unpublishCourseController,
  handleGetCourseDetailsWithRatings,
  getTopRatedCourses,
  getStudentCourseProgress,
} from "../controllers/courseController.js";
import { handleUpdateCourseByFieldsById } from "../controllers/courseController.js";
import { courseUpload } from "../config/multer.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";

const router = express.Router();

router.post("/createCourses", verifyTokenWithSession, handleCreateCourse);
router.get("/getAllCourses", handleGetCourses);
router.get("/getCoursesWithRatings", handleGetCourseDetailsWithRatings);
router.get("/getCourses/:id", handleGetCourseById);
router.patch(
  "/updateAnyFieldCourses/:id",
  verifyTokenWithSession,
  courseUpload.single("thumbnail"),
  handleUpdateCourseByFieldsById
);
router.delete(
  "/deleteCourses/:id",
  verifyTokenWithSession,
  handleDeleteCourseById
);
router.patch(
  "/:courseId/publish",
  verifyTokenWithSession,
  publishCourseController
);
router.patch(
  "/:courseId/unpublish",
  verifyTokenWithSession,
  unpublishCourseController
);
router.get("/top-rated", verifyTokenWithSession, getTopRatedCourses);
router.get(
  "/:studentId/progress",
  verifyTokenWithSession,
  getStudentCourseProgress
);

export default router;

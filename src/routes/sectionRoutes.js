import express from "express";
import {
  createSectionController,
  deleteSectionController,
  getAllSectionsController,
  getCourseSections,
  getSectionByIdController,
  publishSectionController,
  reorderSectionsController,
  unpublishSectionController,
  updateSectionController,
} from "../controllers/sectionController.js";
import { lessonUpload } from "../config/multer.js"; // Assuming there's file upload involved, like with lessonUpload
import { getCompletedSections, handleGetSectionsByCourseId, markSectionAsComplete } from "../controllers/courseController.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";

const router = express.Router();

// Route to create a new section
router.post("/:courseId/createSection",verifyTokenWithSession, createSectionController);

// Route to get all sections
router.get("/:courseId/getAllSections", getAllSectionsController);

router.get(
  "/:courseId/getSections",
  // authenticateUser,
  getCourseSections
);

// Route to get a specific section by ID
router.get("/:courseId/getSection/:id", getSectionByIdController);

// Route to update a section by ID
// router.put(
//   "/updateSection/:id",
//   lessonUpload.fields([ // Define file upload if needed
//     { name: "thumbnail", maxCount: 1 },
//     { name: "document", maxCount: 1 },
//   ]),
//   updateSection
// );

// Route to delete a section by ID
router.delete("/:courseId/deleteSection/:id",verifyTokenWithSession, deleteSectionController);

// Route to patch/update a section partially by ID
router.patch(
  "/:courseId/updateAnySection/:id",verifyTokenWithSession,
  lessonUpload.fields([
    // Define file upload if needed
    { name: "thumbnail", maxCount: 1 },
    { name: "video_url", maxCount: 1 },
  ]),
  updateSectionController
);
router.patch("/:courseId/reorderSections",verifyTokenWithSession, reorderSectionsController);

router.patch(
  "/:courseId/publishSections/:sectionId/publish",verifyTokenWithSession,
  publishSectionController
);
router.patch(
  "/:courseId/publishSections/:sectionId/unpublish",verifyTokenWithSession,
  unpublishSectionController
);
router.get("/:courseId/content", handleGetSectionsByCourseId);
router.post("/mark-complete",verifyTokenWithSession, markSectionAsComplete);
router.get("/:studentId/completed",verifyTokenWithSession, getCompletedSections);

export default router;

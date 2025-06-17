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

const router = express.Router();

// Route to create a new section
router.post("/:courseId/createSection", createSectionController);

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
router.delete("/:courseId/deleteSection/:id", deleteSectionController);

// Route to patch/update a section partially by ID
router.patch(
  "/:courseId/updateAnySection/:id",
  lessonUpload.fields([
    // Define file upload if needed
    { name: "thumbnail", maxCount: 1 },
    { name: "video_url", maxCount: 1 },
  ]),
  updateSectionController
);
router.patch("/:courseId/reorderSections", reorderSectionsController);

router.patch(
  "/:courseId/publishSections/:sectionId/publish",
  publishSectionController
);
router.patch(
  "/:courseId/publishSections/:sectionId/unpublish",
  unpublishSectionController
);
router.get("/:courseId/content", handleGetSectionsByCourseId);
router.post("/mark-complete", markSectionAsComplete);
router.get("/:studentId/completed", getCompletedSections);

export default router;

import express from 'express';
import { 
  handleCreateCourse, 
  handleGetCourses, 
  handleGetCourseById, 
  handleDeleteCourseById, 
  publishCourseController,
  unpublishCourseController,
  handleGetCourseDetailsWithRatings,
  getTopRatedCourses,
  getStudentCourseProgress
} from '../controllers/courseController.js';
import { handleUpdateCourseByFieldsById } from '../controllers/courseController.js';
import { courseUpload } from '../config/multer.js';

const router = express.Router();


router.post('/createCourses', handleCreateCourse);
router.get('/getAllCourses', handleGetCourses);
router.get('/getCoursesWithRatings', handleGetCourseDetailsWithRatings);
router.get('/getCourses/:id', handleGetCourseById);
router.patch('/updateAnyFieldCourses/:id',courseUpload.single('thumbnail'), handleUpdateCourseByFieldsById);
router.delete('/deleteCourses/:id', handleDeleteCourseById);
router.patch("/:courseId/publish", publishCourseController);
router.patch("/:courseId/unpublish", unpublishCourseController);
router.get("/top-rated", getTopRatedCourses);
router.get("/:studentId/progress", getStudentCourseProgress);


export default router;

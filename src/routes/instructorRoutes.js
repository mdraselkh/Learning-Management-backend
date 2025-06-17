import express from "express";
import {
  handleCreateInstructor,
  handleGetInstructors,
  handleGetInstructorById,
  handleUpdateInstructor,
  handleDeleteInstructor,
} from "../controllers/instructorController.js";
import { upload } from "../config/multer.js";


const router = express.Router();

router.post("/createInstructor",upload.single('image'), handleCreateInstructor);
router.get("/getAllInstructors", handleGetInstructors);
router.get("/getInstructor/:id", handleGetInstructorById);
router.put("/updateInstructor/:id", handleUpdateInstructor);
router.delete("/deleteInstructor/:id", handleDeleteInstructor);

export default router;

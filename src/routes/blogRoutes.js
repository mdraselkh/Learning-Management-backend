import express from "express";
import {
  handleCreateBlog,
  handleGetAllBlogs,
  handleGetBlogById,
  handleUpdateBlog,
  handleDeleteBlog
} from "../controllers/blogController.js";
import { blogsUpload } from "../config/multer.js";


const router = express.Router();

// Create a new blog
router.post("/addblog", blogsUpload.single("image_url"), handleCreateBlog);

// Get all blogs
router.get("/getAllBlogs", handleGetAllBlogs);

// Get a single blog by ID
router.get("/getBlog/:id", handleGetBlogById);

// Update a blog by ID
router.patch("/updateBlog/:id", blogsUpload.single("image_url"), handleUpdateBlog);

// Delete a blog by ID
router.delete("/deleteBlog/:id", handleDeleteBlog);

export default router;

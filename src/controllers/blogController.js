import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../models/blogModel.js";

// Create a new blog
export const handleCreateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };

    // Handle image upload if present
    if (req.file) {
      blogData.image_url = req.file.path; // Assuming you're using Multer for file uploads
    }

    const newBlog = await createBlog(blogData);
    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all blogs
export const handleGetAllBlogs = async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single blog by ID
export const handleGetBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await getBlogById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a blog by ID
export const handleUpdateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle image upload if present
    if (req.file) {
      updates.image_url = req.file.path;
    }

    const updatedBlog = await updateBlog(id, updates);

    if (!updatedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a blog by ID
export const handleDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await deleteBlog(id);

    if (!deletedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, data: deletedBlog });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

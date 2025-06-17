import pool from "../config/db.js";
import {
  createCourseModel,
  getCoursesModel,
  getCourseByIdModel,
  updateCourseModel,
  deleteCourseModel,
  publishCourses,
  unpublishCourses,
  getCourseDetailsWithRatings,
  getTopRatedCoursesModel,
  fetchStudentCourseProgress,
  getSectionsByCourseId,
  findProgress,
  updateProgress,
  insertProgress,
} from "../models/courseModel.js";

// Admin: Create a new course
export const handleCreateCourse = async (req, res) => {
  console.log("Body:", req.body);

  const data = {
    ...req.body,
  };

  try {
    const newCourse = await createCourseModel(data);
    res.status(201).json({ success: true, id: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Get all courses
export const handleGetCourses = async (req, res) => {
  const { userId, role } = req.query;
  try {
    const courses = await getCoursesModel(userId, role);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const handleGetCourseDetailsWithRatings = async (req, res) => {
  try {
    const courses = await getCourseDetailsWithRatings();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course details" });
  }
};

// Get course by ID
export const handleGetCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await getCourseByIdModel(id);
    if (course) {
      res.status(200).json({ success: true, data: course });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleUpdateCourseByFieldsById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Body:", req.body);
    console.log("Files:", req.file);

    // Fetch existing course data
    const existingCourse = await getCourseByIdModel(id);
    if (!existingCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Retain or parse updated objectives and tags
    let { objectives, tags, ...otherFields } = req.body;

    // Parse JSON fields if they are strings
    if (typeof objectives === "string") {
      try {
        objectives = JSON.parse(objectives);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for objectives",
        });
      }
    }

    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for tags",
        });
      }
    }

    // Use existing data if no new data is provided
    objectives = objectives || existingCourse.objectives;
    tags = tags || existingCourse.tags;

    // Handle thumbnail if uploaded
    const thumbnailUrl = req.file ? req.file.path : existingCourse.thumbnail;

    // Prepare updated data
    const updatedData = {
      ...existingCourse, // Retain all existing fields
      ...otherFields, // Overwrite with new values from req.body
      objectives,
      tags,
      thumbnail: thumbnailUrl || "",
    };

    // Update the course in the database
    const updatedCourse = await updateCourseModel(id, updatedData);

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Delete a course by ID
export const handleDeleteCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCourse = await deleteCourseModel(id);
    if (deletedCourse) {
      res.status(200).json({ success: true, data: deletedCourse });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const publishCourseController = async (req, res) => {
  const { courseId } = req.params;

  try {
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }
    console.log("Publishing course with ID:", courseId);

    const publishCourse = await publishCourses(courseId);

    return res.status(200).json({
      message: "Course published successfully!",
      course: publishCourse,
    });
  } catch (error) {
    console.error("Error in publishCourseController:", error.message);

    return res.status(500).json({
      message: "Failed to publish the course.",
      error: error.message,
    });
  }
};
export const unpublishCourseController = async (req, res) => {
  const { courseId } = req.params;

  try {
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }
    console.log("Publishing course with ID:", courseId);

    // Call the model function to publish the section
    const unpublishCourse = await unpublishCourses(courseId);

    // Respond with the updated section
    return res.status(200).json({
      message: "Course unpublished successfully!",
      course: unpublishCourse,
    });
  } catch (error) {
    console.error("Error in unpublishCourseController:", error.message);

    return res.status(500).json({
      message: "Failed to unpublish the course.",
      error: error.message,
    });
  }
};

export const getTopRatedCourses = async (req, res) => {
  try {
    const courses = await getTopRatedCoursesModel();

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (err) {
    console.error("🔥 Error in getTopRatedCourses:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching top-rated courses",
    });
  }
};


export const getStudentCourseProgress = async (req, res) => {
  const { studentId } = req.params;

  try {
    const progressData = await fetchStudentCourseProgress(studentId);
    res.status(200).json({
      success: true,
      message: "Course progress fetched successfully.",
      data: progressData,
    });
  } catch (error) {
    console.error("Progress fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course progress.",
    });
  }
};

export const handleGetSectionsByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const sections = await getSectionsByCourseId(courseId);
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    console.error("Error fetching sections:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const markSectionAsComplete = async (req, res) => {
  const { student_id, section_id } = req.body;

  try {
    const existing = await findProgress(student_id, section_id);

    if (existing) {
      await updateProgress(student_id, section_id);
    } else {
      await insertProgress(student_id, section_id);
    }

    res.status(200).json({ message: "Section marked as complete." });
  } catch (error) {
    console.error("Error in markSectionAsComplete:", error.message);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getCompletedSections = async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT section_id FROM progress WHERE student_id = $1 AND is_completed = true`,
      [studentId]
    );

    res.status(200).json({
      message: "Completed sections fetched",
      data: result.rows.map(row => row.section_id),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch completed sections" });
  }
};
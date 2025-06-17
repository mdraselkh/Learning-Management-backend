import {
  createSection,
  deleteSectionModel,
  getAllSectionsModel,
  getSectionByIdModel,
  getSectionsByCourseId,
  publishSections,
  reorderSections,
  unpublishSections,
  updateSectionModel,
} from "../models/sectionModel.js";

// Create a new section
export const createSectionController = async (req, res) => {
  console.log(req.params.courseId);
  try {
    console.log("Body:", req.body);
    const data = {
      ...req.body,
    };

    const newSection = await createSection(req.params.courseId, data); // Pass courseId and section data to create section model
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    console.error("Error in creating section:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all sections for a course
export const getAllSectionsController = async (req, res) => {
  try {
    const sections = await getAllSectionsModel(req.params.courseId); // Get sections by courseId
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getCourseSections = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  console.log(courseId,userId);

  try {
    const sections = await getSectionsByCourseId(userId, courseId);

    res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error("❌ Error fetching sections:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course sections",
    });
  }
};


// Get section by ID
export const getSectionByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await getSectionByIdModel(id);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update section by ID
export const updateSectionController = async (req, res) => {
  const {id } = req.params;
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    let updatedObjectives = req.body.objectives;
    if (typeof updatedObjectives === "string") {
      try {
        updatedObjectives = JSON.parse(updatedObjectives);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON format for objectives",
        });
      }
    }

    const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : null;
    const video = req.files?.video_url ? req.files.video_url[0].path : null;

    // Prepare updated data
    const updatedData = {
      ...req.body,
      objectives: updatedObjectives,
      video_url: video,
      thumbnail: thumbnail,
    };
    console.log(updatedData);

    const updatedSection = await updateSectionModel(id, updatedData);
    if (!updatedSection) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }
    res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete section by ID
export const deleteSectionController = async (req, res) => {
  const {courseId,  id } = req.params;
  console.log(courseId, id);
  try {
    const deleted = await deleteSectionModel(courseId, id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderSectionsController = async (req, res) => {
  const { courseId } = req.params;
  const sections = req.body.updateData; //
  console.log(sections);

  try {
    const result = await reorderSections(courseId, sections);
    if (result) {
      return res
        .status(200)
        .json({ message: "Sections reordered successfully" });
    } else {
      return res.status(400).json({ message: "Failed to reorder sections" });
    }
  } catch (error) {
    console.error("Error in reorderSectionsController:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const publishSectionController = async (req, res) => {
  const { courseId, sectionId } = req.params;

  try {
    if (!courseId || !sectionId) {
      return res
        .status(400)
        .json({ message: "Course ID and Section ID are required." });
    }
    console.log("Publishing section with ID:", courseId, sectionId);

    // Call the model function to publish the section
    const publishSection = await publishSections(courseId, sectionId);

    // Respond with the updated section
    return res.status(200).json({
      message: "Section published successfully!",
      section: publishSection,
    });
  } catch (error) {
    console.error("Error in publishSectionController:", error.message);

    // Respond with an error message
    return res.status(500).json({
      message: "Failed to publish the section.",
      error: error.message,
    });
  }
};
export const unpublishSectionController = async (req, res) => {
  const { courseId, sectionId } = req.params;

  try {
    if (!courseId || !sectionId) {
      return res
        .status(400)
        .json({ message: "Course ID and Section ID are required." });
    }
    console.log("Publishing section with ID:", courseId, sectionId);

    // Call the model function to publish the section
    const unpublishSection = await unpublishSections(courseId, sectionId);

    // Respond with the updated section
    return res.status(200).json({
      message: "Section unpublished successfully!",
      section: unpublishSection,
    });
  } catch (error) {
    console.error("Error in unpublishSectionController:", error.message);

    // Respond with an error message
    return res.status(500).json({
      message: "Failed to unpublish the section.",
      error: error.message,
    });
  }
};

import {
    createInstructor,
    getInstructors,
    getInstructorById,
    deleteInstructorById,
    updateInstructorById
  } from "../models/instructorModel.js";
  
  // Controller to handle instructor creation
  export const handleCreateInstructor = async (req, res) => {
    try {


        console.log('Request Body:', req.body);
        console.log('Request File:', req.file);
    
        const data = req.body;
        data.image_url = req.file ? req.file.path : null;

      const instructor = await createInstructor(data);
      res.status(201).json({
        success: true,
        message: "Instructor created successfully",
        data: instructor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create instructor",
        error: error.message,
      });
    }
  };
  
  // Controller to fetch all instructors
  export const handleGetInstructors = async (req, res) => {
    try {
      const instructors = await getInstructors();
      res.status(200).json({
        success: true,
        data: instructors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructors",
        error: error.message,
      });
    }
  };
  
  // Controller to fetch a single instructor by ID
  export const handleGetInstructorById = async (req, res) => {
    try {
      const { id } = req.params;
      const instructor = await getInstructorById(id);
  
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }
  
      res.status(200).json({
        success: true,
        data: instructor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor",
        error: error.message,
      });
    }
  };



// Controller to delete an instructor by ID
export const handleDeleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await deleteInstructorById(id);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Instructor deleted successfully",
      data: instructor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete instructor",
      error: error.message,
    });
  }
};



// Controller to update an instructor by ID
export const handleUpdateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure all required fields are provided
    if (
      !updateData.fname ||
      !updateData.lname ||
      !updateData.phone ||
      !updateData.email ||
      !updateData.city ||
      !updateData.address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields (fname, lname, phone, email, city, address) must be provided",
      });
    }

    const updatedInstructor = await updateInstructorById(id, updateData);

    if (!updatedInstructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Instructor updated successfully",
      data: updatedInstructor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update instructor",
      error: error.message,
    });
  }
};

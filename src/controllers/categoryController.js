// src/controllers/categoryController.js

import {
  createCategory,
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  updateCategoryById,
  deleteCategoryById,
  getCategoriesWithCourseCount,
} from "../models/categoryModel.js";

// Admin: Create a new category (parent or subcategory)
export const handleCreateCategory = async (req, res) => {
  let parsedCategory = req.body.subcategory;

  if (typeof parsedCategory === "string") {
    try {
      // Strip any additional single quotes or malformed characters
      parsedCategory = parsedCategory.replace(/^'|'$/g, ""); // remove single quotes if present
      parsedCategory = JSON.parse(parsedCategory); // parse the valid JSON string
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid JSON format for subcategory",
      });
    }
  }

  try {
    const newCategory = await createCategory({
      ...req.body,
      subcategory: parsedCategory,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Error creating category" });
  }
};

// Admin: Get all categories and subcategories
export const handleGetCategories = async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};
export const handleGetCategoriesWithCourseCount = async (req, res) => {
  try {
    const categories = await getCategoriesWithCourseCount();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch formatted categories.",
      error: error.message,
    });
  }
};

// Get category by ID
export const handleGetCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await getCategoryById(id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching category by ID" });
  }
};

// Get subcategories based on the category title
export const handleGetSubcategoriesByCategory = async (req, res) => {
  const { categoryTitle } = req.params;

  try {
    const subcategories = await getSubcategoriesByCategory(categoryTitle);
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories" });
  }
};

// Admin: Update a category or subcategory by ID
export const handleUpdateCategoryById = async (req, res) => {
  const { id } = req.params;
  let parsedCategory = req.body.subcategory;

  if (typeof parsedCategory === "string") {
    try {
      // Strip any additional single quotes or malformed characters
      parsedCategory = parsedCategory.replace(/^'|'$/g, ""); // remove single quotes if present
      parsedCategory = JSON.parse(parsedCategory); // parse the valid JSON string
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid JSON format for subcategory",
      });
    }
  }

  try {
    const updatedCategory = await updateCategoryById(id, {
      ...req.body,
      subcategory:parsedCategory,
      
    });
    if (updatedCategory) {
      res.status(200).json(updatedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating category" });
  }
};

// Admin: Delete a category by ID
export const handleDeleteCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await deleteCategoryById(id);
    if (deletedCategory) {
      res.status(200).json(deletedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};

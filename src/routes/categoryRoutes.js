// src/routes/categoryRoutes.js

import express from 'express';
import { 
  handleCreateCategory, 
  handleGetCategories, 
  handleGetCategoryById, 
  handleGetSubcategoriesByCategory,
  handleUpdateCategoryById,
  handleDeleteCategoryById,
  handleGetCategoriesWithCourseCount
} from '../controllers/categoryController.js';
import { verifyTokenWithSession } from '../middlewares/verifyTokenWithSession.js';

const router = express.Router();

// Route to create a new category (parent or subcategory)
router.post('/createCategories',verifyTokenWithSession, handleCreateCategory);

// Route to get all categories and subcategories
router.get('/getAllCategories', handleGetCategories);
router.get('/getCategoriesWithCourseCount', handleGetCategoriesWithCourseCount);

// Route to get a category by ID
router.get('/getCategory/:id', handleGetCategoryById);

// Route to get subcategories by category title
router.get('/subcategories/:categoryTitle', handleGetSubcategoriesByCategory);

// Route to update a category or subcategory by ID
router.put('/updateCategory/:id',verifyTokenWithSession, handleUpdateCategoryById);

// Route to delete a category by ID
router.delete('/deleteCategory/:id',verifyTokenWithSession, handleDeleteCategoryById);

export default router;

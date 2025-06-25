import express from 'express';
import { registerUser, loginUser, getAllRegisteredUsers, getUserByIdHandler, updateUserHandler, deleteUserHandler, makeUserInactive, makeUserBlocked, verifyEmail, getProfileHandler } from '../controllers/userController.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.post('/register',upload.single('image_url'),registerUser);
router.get("/verify-email", verifyEmail);
router.get('/getAllusers', getAllRegisteredUsers);
router.get('/getUser/:id', getUserByIdHandler);
router.get("/auth/profile", getProfileHandler);
router.patch('/updateUser/:id',upload.single('image_url'), updateUserHandler);
router.delete('/deleteUser/:id', deleteUserHandler);
router.post('/login', loginUser);
router.post('/logout/:id', makeUserInactive);
router.patch('/blocked/:id', makeUserBlocked);


export default router; 

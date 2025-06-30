import express from 'express';
import { registerUser, loginUser, getAllRegisteredUsers, getUserByIdHandler, updateUserHandler, deleteUserHandler, makeUserInactive, makeUserBlocked, verifyEmail, getProfileHandler } from '../controllers/userController.js';
import { upload } from '../config/multer.js';
import { verifyTokenWithSession } from '../middlewares/verifyTokenWithSession.js';

const router = express.Router();

router.post('/register',upload.single('image_url'),registerUser);
router.get("/verify-email", verifyEmail);
router.get('/getAllusers', getAllRegisteredUsers);
router.get('/getUser/:id', getUserByIdHandler);
router.get("/auth/profile",verifyTokenWithSession, getProfileHandler);
router.patch('/updateUser/:id',verifyTokenWithSession,upload.single('image_url'), updateUserHandler);
router.delete('/deleteUser/:id',verifyTokenWithSession, deleteUserHandler);
router.post('/login', loginUser);
router.post('/logout/:id',verifyTokenWithSession, makeUserInactive);
router.patch('/blocked/:id',verifyTokenWithSession, makeUserBlocked);


export default router; 

import express from 'express';
import { registerUser, loginUser, getAllRegisteredUsers, getUserByIdHandler, updateUserHandler, deleteUserHandler } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/getAllusers', getAllRegisteredUsers);
router.get('/getUser/:id', getUserByIdHandler);
router.put('/updateUser/:id', updateUserHandler);
router.delete('/deleteUser/:id', deleteUserHandler);
router.post('/login', loginUser);

export default router; 

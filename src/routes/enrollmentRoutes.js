import express from "express";
import { handleAddEnrollmentWithPayment, handleDeleteEnrollment, handleGetAllEnrollments, handleGetEnrollmentsByUser, handleUpdateEnrollStatusAndPaymentStatus } from "../controllers/enrollmentController.js";

const router = express.Router();

// Enroll a student with payment
router.post("/addEnrollment", handleAddEnrollmentWithPayment);

router.get("/getAllEnrollmentUsers/:userId", handleGetEnrollmentsByUser);

router.get("/getAllEnrollments", handleGetAllEnrollments);

// router.patch("/updateEnrollmentStatus/:id", handleUpdateEnrollmentStatus);
router.patch(
    "/updateStatus/:id",
    handleUpdateEnrollStatusAndPaymentStatus
  );

router.delete("/deleteEnrollment/:id", handleDeleteEnrollment);

export default router;

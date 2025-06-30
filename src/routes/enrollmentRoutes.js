import express from "express";
import {
  handleAddEnrollmentWithPayment,
  handleDeleteEnrollment,
  handleGetAllEnrollments,
  handleGetEnrollmentsByUser,
  handleUpdateEnrollStatusAndPaymentStatus,
} from "../controllers/enrollmentController.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";

const router = express.Router();

// Enroll a student with payment
router.post(
  "/addEnrollment",
  verifyTokenWithSession,
  handleAddEnrollmentWithPayment
);

router.get(
  "/getAllEnrollmentUsers/:userId",
  verifyTokenWithSession,
  handleGetEnrollmentsByUser
);

router.get(
  "/getAllEnrollments",
  verifyTokenWithSession,
  handleGetAllEnrollments
);

// router.patch("/updateEnrollmentStatus/:id", handleUpdateEnrollmentStatus);
router.patch(
  "/updateStatus/:id",
  verifyTokenWithSession,
  handleUpdateEnrollStatusAndPaymentStatus
);

router.delete(
  "/deleteEnrollment/:id",
  verifyTokenWithSession,
  handleDeleteEnrollment
);

export default router;

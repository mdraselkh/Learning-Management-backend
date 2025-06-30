import express from "express";
import {
  handleCheckoutSession,
  handleGetAllPayments,
  handleGetPaymentsByStudent,
  handleGetPaymentsByUser,
  handleVerifyPayment,
} from "../controllers/paymentController.js";
import { verifyTokenWithSession } from "../middlewares/verifyTokenWithSession.js";
const router = express.Router();

router.get("/getPaymentByUsers/:userId",verifyTokenWithSession, handleGetPaymentsByUser);
router.get(
  "/getPaymentByStudent/:studentId",
  verifyTokenWithSession,
  handleGetPaymentsByStudent
);

router.get("/getAllPayments",verifyTokenWithSession, handleGetAllPayments);
router.get("/verify-payment",verifyTokenWithSession, handleVerifyPayment);
router.post("/create-checkout-session",verifyTokenWithSession, handleCheckoutSession);

// router.patch("/updatePaymentStatus/:id", handleUpdatePaymentStatus);

export default router;

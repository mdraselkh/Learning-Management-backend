import express from "express";
import {
  handleCheckoutSession,
  handleGetAllPayments,
  handleGetPaymentsByStudent,
  handleGetPaymentsByUser,
  handleVerifyPayment,
} from "../controllers/paymentController.js";
const router = express.Router();

router.get("/getPaymentByUsers/:userId", handleGetPaymentsByUser);
router.get("/getPaymentByStudent/:studentId", handleGetPaymentsByStudent);

router.get("/getAllPayments", handleGetAllPayments);
router.get("/verify-payment", handleVerifyPayment);
router.post("/create-checkout-session", handleCheckoutSession);

// router.patch("/updatePaymentStatus/:id", handleUpdatePaymentStatus);

export default router;

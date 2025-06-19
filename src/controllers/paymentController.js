import pool from "../config/db.js";
import {
  getAllPayments,
  getPaymentsByStudentId,
  getPaymentsByUser,
  updatePaymentStatus,
} from "../models/paymentModel.js";

export const handleGetPaymentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const payments = await getPaymentsByUser(userId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const handleGetAllPayments = async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

import Stripe from "stripe"; // Import Stripe using ES module syntax
const stripe = new Stripe(process.env.STRIPE_SECRET);

export const handleCheckoutSession = async (req, res) => {
  try {
    const { products, userId } = req.body;

    console.log("products ", products);
    console.log("userId ", userId);

    if (
      !Array.isArray(products) ||
      !products.every((p) => p.id && p.coursefee)
    ) {
      return res.status(400).json({ error: "Invalid products data" });
    }

    // Conversion rate from TK to USD (adjust this rate as per your needs)
    const conversionRate = 0.0091; // Example: 1 TK = 0.0091 USD

    // Prepare line items for Stripe session
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd", // Stripe supports "usd"
        product_data: {
          name: product.title,
          images: [product.img],
        },
        unit_amount: Math.round(product.coursefee * conversionRate * 100), // Convert TK to USD and to cents
      },
      quantity: 1, // Fixed at 1 for course purchases
    }));

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        "https://learning-management-frontend.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://learning-management-frontend.vercel.app//cancel",
      // success_url:
      //   "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      // cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId: userId, // pass actual user ID here
        courseId: products[0].id, // assuming one course at a time
      },
    });

    res.json({ id: session.id, url: session.url }); // Include the session URL for redirection
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error.message);
    res.status(500).json({ error: "Failed to create Stripe checkout session" });
  }
};

// const stripeClient = stripe(process.env.STRIPE_SECRET);
export const handleVerifyPayment = async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing session_id" });
  }

  try {
    // Step 1: Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const userId = session.metadata.userId;
    const courseId = session.metadata.courseId;

    // Step 2: Check in the database if payment & enrollment exist
    const paymentRes = await pool.query(
      "SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND status = 'completed'",
      [userId, courseId]
    );

    const enrollmentRes = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'",
      [userId, courseId]
    );

    if (paymentRes.rowCount > 0 && enrollmentRes.rowCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Payment verified and enrollment active",
        userId,
        courseId
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Payment or enrollment not found" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const handleGetPaymentsByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const payments = await getPaymentsByStudentId(studentId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
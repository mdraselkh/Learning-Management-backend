// routes/webhookRoutes.js
import express from "express";
import { handleStripeWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;

// router.post("/", express.raw({ type: "application/json" }), (req, res) => {
//   console.log("💥 Webhook hit!");
//   res.status(200).send("✅ Received");
// });


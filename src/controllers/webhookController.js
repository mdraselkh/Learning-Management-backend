// controllers/webhookController.js
import Stripe from "stripe";
import pool from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Load from .env

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(event);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("session data", session);

    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;
    const amount = session?.amount_total / 100;
    const paymentMethod = session?.payment_method_types[0];

    if (!userId || !courseId) {
      console.error("❌ Missing metadata (userId/courseId)");
      return res.status(400).send("Missing userId or courseId in metadata");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existingPayment = await client.query(
        `SELECT id FROM payments WHERE user_id = $1 AND course_id = $2 AND amount = $3 AND status = 'completed'`,
        [userId, courseId, amount]
      );

      let paymentId;

      if (existingPayment.rows.length > 0) {
        paymentId = existingPayment.rows[0].id;
        console.log("🌀 Payment already exists. Using existing ID:", paymentId);
      } else {
        const paymentResult = await client.query(
          `INSERT INTO payments (user_id, course_id, amount, payment_method, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
          [userId, courseId, amount, paymentMethod, "completed"]
        );

        paymentId = paymentResult.rows[0].id;
        console.log("🚀 Inserted new Payment ID:", paymentId);
      }


      await client.query(
        `INSERT INTO enrollments (user_id, course_id,payment_id, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, course_id) DO UPDATE SET status = EXCLUDED.status, payment_id = EXCLUDED.payment_id;`,
        [userId, courseId, paymentId, "active"]
      );

    //   await client.query(
    //     `UPDATE sections SET is_free = TRUE WHERE course_id = $1;`,
    //     [courseId]
    //   );

      await client.query("COMMIT");

      console.log("✅ Payment, enrollment & section updated successfully");
      res.status(200).send("Webhook handled successfully");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ DB operation failed:", err.message);
      res.status(500).send("Webhook processing error");
    } finally {
      client.release();
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    res.status(200).send("Event type not handled");
  }
};

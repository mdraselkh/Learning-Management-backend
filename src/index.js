import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import createUserTable from "./data/createUserTable.js";
import createInstructorTable from "./data/createInstructorTable.js";
import createCategoryTable from "./data/createCategoryTable.js";
import createEnrollmentTable from "./data/enrollmentTable.js";
import createPaymentTable from "./data/paymentTable.js";
import createReviewTable from "./data/reviewTable.js";
import createBlogsTable from "./data/blogsTable.js";
import createTables from "./data/courseTable.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://learning-management-frontend.vercel.app",
  // "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/webhook", webhookRoutes);

//middlewares
app.use(express.json());

// app.use(passport.initialize());
// app.use(passport.session());

// Plug your Google routes 🔌
// app.use("/api/auth", oauthRoutes);

app.set('trust proxy', true); // Important if deploying on Vercel, Render, etc.

app.get("/api/user-ip", (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  res.json({ ip });
});

//routes
app.use("/api/users", userRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/section", sectionRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/dashboard", dashboardRoutes);

const initTables = async () => {
  try {
    await createUserTable();
    await createInstructorTable();
    await createCategoryTable();
    await createTables(); // courses
    await createPaymentTable(); // payment before enrollment
    await createEnrollmentTable(); // enrollment depends on payment + course
    await createReviewTable();
    await createBlogsTable();
    console.log("✅ All tables created successfully!");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1); // stop server if tables fail
  }
};

// ✅ Start server after DB is ready
const startServer = async () => {
  await initTables();

  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
};

startServer();

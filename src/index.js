import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes.js';
import createUserTable from "./data/createUserTable.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());

//testing
// app.get("/", async (req, res) => {
//   const result = await pool.query("SELECT current_database()");
//   res.send(result.rows[0].current_database);
// });

//routes
app.use('/api/users',userRoutes);

createUserTable();

//server running
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

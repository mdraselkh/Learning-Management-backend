import pool from "../config/db.js";

const createPaymentTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      amount NUMERIC(10, 2) NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_method VARCHAR(50) NOT NULL,
      status VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Payment table created successfully");
  } catch (error) {
    console.error("Error creating payment table:", error);
  }
};

export default createPaymentTable;

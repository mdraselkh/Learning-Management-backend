import pool from "../config/db.js";


export const createInstructor = async (data) => {
    const {
      fname,
      lname,
      phone,
      email,
      city,
      address,
      image_url,
      description,
    } = data;
  
    try {
      const query = `
        INSERT INTO instructor (fname, lname, phone, email, city, address, image_url, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        fname,
        lname,
        phone,
        email,
        city,
        address,
        image_url,
        description,
      ];
  
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating instructor:", error);
      throw error;
    }
  };
  
// Function to fetch all instructors
export const getInstructors = async () => {
  try {
    const query = "SELECT * FROM instructor;";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching instructors:", error.message);
    throw new Error("Could not fetch instructors.");
  }
};

// Function to fetch a single instructor by ID
export const getInstructorById = async (id) => {
  try {
    const query = "SELECT * FROM instructor WHERE id = $1;";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Instructor with ID ${id} not found.`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching instructor:", error.message);
    throw new Error("Could not fetch the instructor.");
  }
};

// Function to delete an instructor by ID
export const deleteInstructorById = async (id) => {
  try {
    const query = "DELETE FROM instructor WHERE id = $1 RETURNING *;";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Instructor with ID ${id} not found.`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error deleting instructor:", error.message);
    throw new Error("Could not delete the instructor.");
  }
};

// Function to update an instructor by ID
export const updateInstructorById = async (id, updateData) => {
  try {
    const query = `
        UPDATE instructor
        SET fname = $1, lname = $2, phone = $3, email = $4, city = $5, address = $6, image_url = $7, description = $8
        WHERE id = $9
        RETURNING *;
      `;

    const values = [
      updateData.fname || null,
      updateData.lname || null,
      updateData.phone || null,
      updateData.email || null,
      updateData.city || null,
      updateData.address || null,
      updateData.image_url || null,
      updateData.description || null,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`Instructor with ID ${id} not found.`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating instructor:", error.message);
    throw new Error("Could not update the instructor.");
  }
};

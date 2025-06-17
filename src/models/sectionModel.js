import pool from "../config/db.js";

// Create a new section for a course
const createSection = async (courseId, sectionData) => {
  const { title } = sectionData;

  // Fetch the latest section based on position to calculate the new position
  const lastSecQuery =
    "SELECT * FROM sections WHERE course_id = $1 ORDER BY position DESC LIMIT 1";

  try {
    const lastSecResult = await pool.query(lastSecQuery, [courseId]);
    const lastSection = lastSecResult.rows[0];

    // Calculate the new position
    const newPosition = lastSection ? lastSection.position + 1 : 0;

    // Insert the new section with the calculated position
    const query = `
      INSERT INTO sections (title, course_id, position)
      VALUES ($1, $2, $3) RETURNING *
    `;

    const values = [title, courseId, newPosition];
    console.log(values);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error creating section: " + error.message);
  }
};

// Get all sections for a course
const getAllSectionsModel = async (courseId) => {
  const query = "SELECT * FROM sections WHERE course_id = $1";
  try {
    const result = await pool.query(query, [courseId]);
    return result.rows;
  } catch (error) {
    throw new Error("Error fetching sections: " + error.message);
  }
};

export const getSectionsByCourseId = async (userId, courseId) => {
  const query = `
    SELECT s.*,
      CASE
        WHEN s.is_free = TRUE THEN TRUE
        WHEN e.status = 'active' THEN TRUE
        ELSE FALSE
      END AS can_access
    FROM sections s
    LEFT JOIN enrollments e
      ON e.course_id = s.course_id AND e.user_id = $1
    WHERE s.course_id = $2
    ORDER BY s.position;
  `;

  const result = await pool.query(query, [userId, courseId]);
  return result.rows;
};

// Get a section by ID
const getSectionByIdModel = async (sectionId) => {
  const query = "SELECT * FROM sections WHERE id = $1";
  try {
    const result = await pool.query(query, [sectionId]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error fetching section: " + error.message);
  }
};

// Update a section by ID
// const updateSectionModel = async (sectionId, sectionData) => {
//   const { title, subtitle, description, video_url, position, is_published, is_free, thumbnail } = sectionData;

//   const query = `
//     UPDATE sections
//     SET title = $1, subtitle = $2, description = $3, video_url = $4, position = $5,
//         is_published = $6, is_free = $7, thumbnail = $8
//     WHERE id = $9 RETURNING *
//   `;

//   const values = [title, subtitle, description, video_url, position, is_published, is_free, thumbnail, sectionId];

//   try {
//     const result = await pool.query(query, values);
//     return result.rows[0];
//   } catch (error) {
//     throw new Error("Error updating section: " + error.message);
//   }
// };

const updateSectionModel = async (sectionId, sectionData) => {
  const fieldsToUpdate = [];
  const values = [];

  // Check each field and add to the fieldsToUpdate array if present
  if (sectionData.title) {
    fieldsToUpdate.push(`title = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.title);
  }
  if (sectionData.subtitle) {
    fieldsToUpdate.push(`subtitle = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.subtitle);
  }
  if (sectionData.description) {
    fieldsToUpdate.push(`description = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.description);
  }
  if (sectionData.video_url) {
    fieldsToUpdate.push(`video_url = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.video_url);
  }
  if (sectionData.position) {
    fieldsToUpdate.push(`position = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.position);
  }
  if (sectionData.is_published !== undefined) {
    // Allow false values to be updated
    fieldsToUpdate.push(`is_published = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.is_published);
  }
  if (sectionData.is_free !== undefined) {
    // Allow false values to be updated
    fieldsToUpdate.push(`is_free = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.is_free);
  }
  if (sectionData.thumbnail) {
    fieldsToUpdate.push(`thumbnail = $${fieldsToUpdate.length + 1}`);
    values.push(sectionData.thumbnail);
  }

  // If no fields are provided, return an error
  if (fieldsToUpdate.length === 0) {
    throw new Error("No valid fields to update.");
  }

  // Construct the dynamic update query
  const query = `
    UPDATE sections 
    SET ${fieldsToUpdate.join(", ")} 
    WHERE id = $${fieldsToUpdate.length + 1} 
    RETURNING *
  `;

  // Add sectionId as the last value for the WHERE clause
  values.push(sectionId);

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error updating section: " + error.message);
  }
};

// Delete a section by ID
const deleteSectionModel = async (courseId, sectionId) => {
  const query =
    "DELETE FROM sections WHERE id = $1 AND course_id = $2 RETURNING *";
  try {
    // Pass both sectionId and courseId in a single array
    const result = await pool.query(query, [sectionId, courseId]);
    return result.rowCount > 0;
  } catch (error) {
    throw new Error("Error deleting section: " + error.message);
  }
};

// Reorder sections based on the new positions provided
const reorderSections = async (courseId, sections) => {
  const client = await pool.connect();
  try {
    // Begin a transaction
    await client.query("BEGIN");

    // Loop through the sections array to update each section's position
    for (const section of sections) {
      const { id, position } = section;

      // Update the section's position in the database
      await client.query(
        `UPDATE sections SET position = $1 WHERE id = $2 AND course_id = $3`,
        [position, id, courseId]
      );
    }

    // Commit the transaction
    await client.query("COMMIT");
    return true; // Indicating success
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");
    console.error("Error reordering sections:", error);
    throw new Error("Failed to reorder sections");
  } finally {
    client.release(); // Release the database client
  }
};

const publishSections = async (courseId, sectionId) => {
  try {
    console.log(
      "Publishing section with ID:",
      sectionId,
      "and course ID:",
      courseId
    );

    // Update the `is_published` field and set the `published_at` timestamp
    const query = `
      UPDATE sections
      SET is_published = $1, published_at = NOW()
      WHERE id = $2 AND course_id = $3
      RETURNING *; 
    `;
    const values = [true, sectionId, courseId];

    // Execute the query and return the updated section
    const result = await pool.query(query, values);

    console.log("Rows affected:", result.rowCount);
    console.log("Updated section:", result.rows[0]);

    if (result.rowCount === 0) {
      throw new Error("No matching section found to update.");
    }

    return result.rows[0]; // Return the updated section
  } catch (error) {
    console.error("Error in publishSections model:", error.message);
    throw new Error(error.message); // Re-throw the error to be handled in the controller
  }
};

const unpublishSections = async (courseId, sectionId) => {
  try {
    // Update the `published` field and set the `published_at` timestamp
    const query = `
      UPDATE sections
      SET is_published = $1, published_at = NOW()
      WHERE id = $2 AND course_id = $3
      RETURNING *; 
    `;
    const values = [false, sectionId, courseId];

    const result = await pool.query(query, values);

    console.log("Rows affected:", result.rowCount);
    console.log("Updated section:", result.rows[0]);

    if (result.rowCount === 0) {
      throw new Error("No matching section found to update.");
    }

    return result.rows[0]; // Return the updated section
  } catch (error) {
    console.error("Error in unpublishSections model:", error.message);
    throw new Error(error.message); // Re-throw the error to be handled in the controller
  }
};

export {
  createSection,
  getAllSectionsModel,
  getSectionByIdModel,
  updateSectionModel,
  deleteSectionModel,
  reorderSections,
  publishSections,
  unpublishSections,
};

import pool from "../config/db.js";

export const createCourseModel = async (courseData) => {
  const { title, category_id, instructors } = courseData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryIdInt = parseInt(category_id, 10);

    // Check if the categoryId is a valid number
    if (isNaN(categoryIdInt)) {
      throw new Error("Invalid categoryId");
    }

    const courseQuery = `
      INSERT INTO courses (
        title,category_id
      )
      VALUES ($1, $2)
      RETURNING id;
    `;

    const courseResult = await client.query(courseQuery, [
      title,
      categoryIdInt,
    ]);

    const courseId = courseResult.rows[0].id;

    console.log(instructors);

    if (instructors && instructors.length > 0) {
      // Ensure instructors are integers
      const instructorIds = instructors.map((instructor) =>
        parseInt(instructor, 10)
      );

      const instructorQuery = `
        INSERT INTO course_instructors (course_id, instructor_id)
        SELECT $1, unnest($2::int[]);
      `;

      // Insert instructor IDs for the course
      await client.query(instructorQuery, [courseId, instructorIds]);
    }

    await client.query("COMMIT");

    return courseId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// export const getCoursesModel = async () => {
//   const query = `
//       SELECT c.*,
//       cat.category_title AS category_title,
//       CASE
//         WHEN c.price = 0 THEN 'free'
//         ELSE 'paid'
//       END AS access_type,
//              COALESCE(json_agg(
//                jsonb_build_object(
//                  'id', i.id,
//                  'name', i.name,
//                  'email', i.email,
//                  'image_url', i.image_url
//                )
//              ) FILTER (WHERE i.id IS NOT NULL), '[]') AS instructor
//       FROM courses c
//       LEFT JOIN categories cat ON c.category_id = cat.id
//       LEFT JOIN course_instructors ci ON c.id = ci.course_id
//       LEFT JOIN users i ON ci.instructor_id = i.id AND i.role = 'instructor'
//       GROUP BY c.id, cat.category_title;
//     `;

//   const result = await pool.query(query);
//   return result.rows;
// };

export const getCoursesModel = async (userId, role) => {
  const baseSelect = `
    SELECT 
      c.*,
      cat.category_title AS category_title,

      CASE 
        WHEN c.price = 0 THEN 'free'
        ELSE 'paid'
      END AS access_type,

      COALESCE(json_agg(
        jsonb_build_object(
          'id', i.id,
          'name', i.name,
          'email', i.email,
          'image_url', i.image_url
        )
      ) FILTER (WHERE i.id IS NOT NULL), '[]') AS instructor,

      COUNT(DISTINCT e.id) AS enrolled_count,
      ROUND(AVG(r.rating), 1) AS avg_rating
  `;

  const baseJoin = `
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN course_instructors ci ON c.id = ci.course_id
    LEFT JOIN users i ON ci.instructor_id = i.id AND i.role = 'instructor'
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN reviews r ON c.id = r.course_id
  `;

  let whereClause = "";
  let params = [];

  if (role === "instructor") {
    whereClause = `WHERE ci.instructor_id = $1`;
    params.push(userId);
  } else if (role === "student") {
    whereClause = `WHERE c.id IN (
      SELECT course_id FROM enrollments WHERE user_id = $1
    )`;
    params.push(userId);
  }

  const groupBy = `GROUP BY c.id, cat.category_title`;

  const finalQuery = `
    ${baseSelect}
    ${baseJoin}
    ${whereClause}
    ${groupBy};
  `;

  const result =
    role === "admin"
      ? await pool.query(`${baseSelect} ${baseJoin} ${groupBy}`)
      : await pool.query(finalQuery, params);

  return result.rows;
};

export const getCourseByIdModel = async (id) => {
  const query = `
      SELECT c.*, 
             COALESCE(json_agg(
               jsonb_build_object(
                 'id', i.id,
                 'name', i.name,
                 'email', i.email,
                 'image_url', i.image_url
               )
             ) FILTER (WHERE i.id IS NOT NULL), '[]') AS instructor
      FROM courses c
      LEFT JOIN course_instructors ci ON c.id = ci.course_id
      LEFT JOIN users i ON ci.instructor_id = i.id AND i.role = 'instructor'
      WHERE c.id = $1
      GROUP BY c.id;
    `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const deleteCourseModel = async (id) => {
  const query = `DELETE FROM courses WHERE id = $1 RETURNING *;`;

  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

export const updateCourseModel = async (id, updatedData) => {
  const {
    title,
    description,
    objectives,
    tags,
    target_audience,
    category_id,
    price,
    course_label,
    language,
    total_lesson,
    lesson_duration,
    time_span,
    thumbnail,
    is_published,
    instructors,
  } = updatedData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create an array of key-value pairs for fields to be updated
    const updates = [];
    const values = [];
    let index = 1;

    // Add dynamic SET fields for the course update
    if (title !== undefined) {
      updates.push(`title = $${index++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${index++}`);
      values.push(description);
    }
    if (objectives !== undefined) {
      updates.push(`objectives = $${index++}`);
      values.push(JSON.stringify(objectives));
    }
    if (tags !== undefined) {
      updates.push(`tags = $${index++}`);
      values.push(JSON.stringify(tags));
    }
    if (target_audience !== undefined) {
      updates.push(`target_audience = $${index++}`);
      values.push(target_audience);
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${index++}`);
      values.push(category_id);
    }
    if (price !== undefined) {
      updates.push(`price = $${index++}`);
      values.push(price);
    }
    if (course_label !== undefined) {
      updates.push(`course_label = $${index++}`);
      values.push(course_label);
    }
    if (language !== undefined) {
      updates.push(`language = $${index++}`);
      values.push(language);
    }
    if (total_lesson !== undefined) {
      updates.push(`total_lesson = $${index++}`);
      values.push(total_lesson);
    }
    if (lesson_duration !== undefined) {
      updates.push(`lesson_duration = $${index++}`);
      values.push(lesson_duration);
    }
    if (time_span !== undefined) {
      updates.push(`time_span = $${index++}`);
      values.push(time_span);
    }
    if (thumbnail !== undefined) {
      updates.push(`thumbnail = $${index++}`);
      values.push(thumbnail);
    }
    if (is_published !== undefined) {
      updates.push(`is_published = $${index++}`);
      values.push(is_published);
    }

    // Prepare the final UPDATE query string
    const setClause = updates.join(", ");
    const query = `
        UPDATE courses
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index++}
        RETURNING *;
      `;

    // Push the course ID as the last value
    values.push(id);

    // Execute the query
    const result = await client.query(query, values);
    const updatedCourse = result.rows[0];

    // Handle updating instructors separately if provided
    if (instructors && instructors.length > 0) {
      const instructorQuery = `
          DELETE FROM course_instructors WHERE course_id = $1;
          INSERT INTO course_instructors (course_id, instructor_id)
          SELECT $2, unnest($3::int[]);
        `;

      await client.query(instructorQuery, [id, id, instructors]);
    }

    await client.query("COMMIT");
    return updatedCourse;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const publishCourses = async (courseId) => {
  try {
    console.log("Publishing course with ID:", courseId);

    // Update the `is_published` field and set the `published_at` timestamp
    const query = `
      UPDATE courses
      SET is_published = $1, published_at = NOW()
      WHERE id = $2
      RETURNING *; 
    `;
    const values = [true, courseId];

    // Execute the query and return the updated section
    const result = await pool.query(query, values);

    console.log("Rows affected:", result.rowCount);
    console.log("Updated course:", result.rows[0]);

    if (result.rowCount === 0) {
      throw new Error("No matching course found to update.");
    }

    return result.rows[0]; // Return the updated section
  } catch (error) {
    console.error("Error in publishCourse model:", error.message);
    throw new Error(error.message); // Re-throw the error to be handled in the controller
  }
};

export const unpublishCourses = async (courseId) => {
  try {
    // Update the `published` field and set the `published_at` timestamp
    const query = `
      UPDATE courses
      SET is_published = $1, published_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const values = [false, courseId];

    const result = await pool.query(query, values);

    console.log("Rows affected:", result.rowCount);
    console.log("Updated course:", result.rows[0]);

    if (result.rowCount === 0) {
      throw new Error("No matching course found to update.");
    }

    return result.rows[0]; // Return the updated section
  } catch (error) {
    console.error("Error in unpublishCourse model:", error.message);
    throw new Error(error.message); // Re-throw the error to be handled in the controller
  }
};

export const getCourseDetailsWithRatings = async () => {
  const query = `
    SELECT 
        c.id,
        c.thumbnail AS img,
        cat.category_title AS categoryName,
        c.is_published,
        CASE 
            WHEN c.price = 0 THEN 'Free'
            ELSE c.price::TEXT
        END AS courseFee,
        c.title,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS rating,
        COUNT(r.id) AS reviewNo
    FROM 
        courses c
    LEFT JOIN 
        categories cat ON c.category_id = cat.id
    LEFT JOIN 
        reviews r ON c.id = r.course_id
    GROUP BY 
        c.id, cat.category_title;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching course details with ratings:", error.message);
    throw error;
  }
};

export const getTopRatedCoursesModel = async () => {
  const query = `
    SELECT 
      c.id,
      c.title,
      c.thumbnail,
      c.price,
      COUNT(DISTINCT e.id) AS enrolled_count,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COALESCE(json_agg(
        DISTINCT jsonb_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image_url', u.image_url
        )
      ) FILTER (WHERE u.id IS NOT NULL), '[]') AS instructors
    FROM 
      courses c
    LEFT JOIN course_instructors ci ON c.id = ci.course_id
    LEFT JOIN users u ON ci.instructor_id = u.id AND u.role = 'instructor'
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN reviews r ON c.id = r.course_id
    GROUP BY 
      c.id
    ORDER BY 
      avg_rating DESC NULLS LAST;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching top rated courses:", error.message);
    throw error;
  }
};

export const fetchStudentCourseProgress = async (studentId) => {
  const query = `
    SELECT 
      c.*,
      COUNT(DISTINCT s.id) AS total_sections,
      COUNT(DISTINCT p.section_id) AS completed_sections,
      ROUND(
        CASE 
          WHEN COUNT(DISTINCT s.id) = 0 THEN 0
          ELSE (COUNT(DISTINCT p.section_id)::decimal / COUNT(DISTINCT s.id)) * 100
        END
      , 1) AS progress_percent,
      CASE
        WHEN COUNT(DISTINCT p.section_id) = 0 THEN 'Enrolled Courses'
        WHEN COUNT(DISTINCT p.section_id) = COUNT(DISTINCT s.id) THEN 'Completed'
        ELSE 'In Progress'
      END AS course_status
    FROM 
      courses c
    JOIN 
      sections s ON s.course_id = c.id
    JOIN 
      enrollments e ON e.course_id = c.id
    LEFT JOIN 
      progress p ON p.section_id = s.id AND p.student_id = $1 AND p.is_completed = true
    WHERE 
      e.user_id = $1
    GROUP BY 
      c.id, c.title;
  `;

  const result = await pool.query(query, [studentId]);
  return result.rows;
};

export const getSectionsByCourseId = async (courseId) => {
  const query = `
    SELECT * FROM sections 
    WHERE course_id = $1 
    ORDER BY position ASC;
  `;

  const result = await pool.query(query, [courseId]);
  return result.rows;
};

export const findProgress = async (studentId, sectionId) => {
  const result = await pool.query(
    "SELECT * FROM progress WHERE student_id = $1 AND section_id = $2",
    [studentId, sectionId]
  );
  return result.rows[0];
};

export const updateProgress = async (studentId, sectionId) => {
  return await pool.query(
    "UPDATE progress SET is_completed = true, updated_at = CURRENT_TIMESTAMP WHERE student_id = $1 AND section_id = $2",
    [studentId, sectionId]
  );
};

export const insertProgress = async (studentId, sectionId) => {
  return await pool.query(
    "INSERT INTO progress (student_id, section_id, is_completed) VALUES ($1, $2, true)",
    [studentId, sectionId]
  );
};
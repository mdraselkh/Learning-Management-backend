import { getCourseByIdModel } from "../models/courseModel.js";
import { getEnrollmentByUserIdAndCourseId } from "../models/enrollmentModel.js";
import { getAllEnrollments } from "../models/enrollmentModel.js";
import { deleteEnrollment } from "../models/enrollmentModel.js";
import { updateEnrollmentStatus } from "../models/enrollmentModel.js";
import { getEnrollmentsByUser } from "../models/enrollmentModel.js";
import { addEnrollment } from "../models/enrollmentModel.js";
import { addPayment, updatePaymentStatus } from "../models/paymentModel.js";
import { getUserById, updateUser } from "../models/userModel.js";

// Enroll a student with payment
export const handleAddEnrollmentWithPayment = async (req, res) => {
  const {
    studentId,
    courseId,
    paymentMethod,
    paymentStatus,
    enrollStatus,
    city,
    phone,
    address,
    email,
  } = req.body;

  console.log("post body", req.body);

  try {
    // Add payment first

    const courseDetails = await getCourseByIdModel(courseId);
    console.log("courseDetails", courseDetails); // Check if course details are being fetched correctly

    // Get the price of the course
    const amount = parseFloat(courseDetails.price);

    // Ensure that courseDetails.data exists and contains a price field
    if (!courseDetails || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Course details are missing or invalid.",
      });
    }

    const existingEnrollment = await getEnrollmentByUserIdAndCourseId(
      studentId,
      courseId
    );
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in this course.",
      });
    }

    const payment = await addPayment(
      studentId,
      courseId,
      amount,
      paymentMethod,
      paymentStatus
    );

    // Enroll student using payment ID
    const enrollment = await addEnrollment(
      studentId,
      courseId,
      payment.id,
      enrollStatus
    );

    let user;

    if (city || phone || address || email) {
      const data = {}; // Initialize an empty object to store the updated fields

      // Add the provided fields to the data object
      if (city) data.city = city;
      if (phone) data.phone = phone;
      if (address) data.address = address;
      if (email) data.email = email;

      // Update the user with the new data
      user = await updateUser(studentId, data);
    } else {
      // If no data to update, return the current user info
      user = await getUserById(studentId); // Function to fetch current user details
      console.log(user); // Log the current user details (optional)
    }

    res.status(201).json({
      success: true,
      data: { enrollment, payment, user },
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all enrollments for a user
export const handleGetEnrollmentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const enrollments = await getEnrollmentsByUser(userId);
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const handleGetAllEnrollments = async (req, res) => {
  try {
    const enrollments = await getAllEnrollments();
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//   // Update enrollment status
// export const handleUpdateEnrollmentStatus = async (req, res) => {
//   const { id } = req.params;
//   console.log(id);
//   const { enrollmentStatus } = req.body;

//   try {
//     const updatedEnrollment = await updateEnrollmentStatus(
//       id,
//       enrollmentStatus
//     );
//     res.status(200).json({ success: true, data: updatedEnrollment });
//   } catch (error) {
//     console.error("Error updating enrollment status:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

//   // Delete enrollment
export const handleDeleteEnrollment = async (req, res) => {
  const { id } = req.params; // Extracting the enrollment ID from request parameters
  console.log(`Deleting enrollment with ID: ${id}`);

  try {
    // Assuming deleteEnrollment(id) is a function that deletes an enrollment by its ID
    const result = await deleteEnrollment(id);

    if (result) {
      res.status(200).json({ success: true, message: "Enrollment deleted" });
    } else {
      res.status(404).json({ success: false, message: "Enrollment not found" });
    }
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleUpdateEnrollStatusAndPaymentStatus = async (req, res) => {
  const { id } = req.params; // studentId
  const { enrollStatus, paymentStatus } = req.body;
  console.log(enrollStatus, paymentStatus);

  try {
    // Check if the enrollment exists for the given studentId
    const existingEnrollments = await getEnrollmentsByUser(id);

    if (!existingEnrollments || existingEnrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found for the given student ID.",
      });
    }

    // Assume updating the first enrollment in the array for simplicity
    const enrollmentData = existingEnrollments[0].enrollment;
    const paymentData = existingEnrollments[0].payment;

    console.log(enrollmentData.id, paymentData.id);

    if (enrollStatus !== undefined) {
      await updateEnrollmentStatus(enrollmentData.id, enrollStatus);
    }

    if (paymentStatus !== undefined) {
      await updatePaymentStatus(paymentData.id, paymentStatus); // Update paymentStatus
    }

    res.status(200).json({
      success: true,
      message: "Enrollment and/or payment status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating enrollment or payment status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the enrollment.",
      error: error.message,
    });
  }
};

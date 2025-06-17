import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinaryConfig.js";

// Instructor image storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instructors", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
  },
});

// Course image storage
const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
  },
});


const blogsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
  },
});

const lessonStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "lessons", // Folder for storing files
      resource_type: "auto", // Allow both images and videos
    },
  });
  
const lessonUpload = multer({ storage:lessonStorage });
const upload = multer({ storage }); 
const courseUpload = multer({ storage: courseStorage }); 
const blogsUpload = multer({ storage: blogsStorage }); 

export { upload, courseUpload, lessonUpload, blogsUpload};

import multer from "multer";
import { v4 as uuid } from "uuid";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const id = uuid();
    let folder = "uploads"; // folder name in Cloudinary

    // Optionally, categorize files
    if (file.mimetype.startsWith("image/")) folder = "images";
    else if (file.mimetype.startsWith("video/")) folder = "videos";
    else if (file.mimetype === "application/pdf") folder = "pdfs";

    return {
      folder,
      public_id: id,
      resource_type: "auto", // auto-detect image, video, pdf
    };
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only video, PDF, and image files are allowed"), false);
};

// Export multer middleware
export const uploadFiles = multer({ storage, fileFilter }).single("file");

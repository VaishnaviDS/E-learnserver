import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

// Storage config for PDFs only
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/pdfs"); // folder path
  },
  filename(req, file, cb) {
    const id = uuid();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  },
});

// Only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

// Single file upload middleware
export const uploadPdf = multer({ storage, fileFilter }).single("file");

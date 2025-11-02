import express from "express";
import { uploadPdf } from "../middlewares/pdfUpload.js";

const router = express.Router();

router.post("/upload-pdf", uploadPdf, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const pdfUrl = `/uploads/pdfs/${req.file.filename}`;
    res.status(200).json({
      message: "PDF uploaded successfully",
      fileUrl: pdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import express from 'express';
import dotenv from 'dotenv';
import { connectdb } from './Database/db.js';
import userRouter from './routes/user.js';
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';
import pdfRoutes from "./routes/pdf.js";
import testimonialRoutes from "./routes/testimonials.js"
import Razorpay from 'razorpay';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // ✅ You missed this import!

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Ensure uploads/pdfs folder exists
const pdfDir = path.join(process.cwd(), "uploads/pdfs");
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// ✅ Serve local PDF uploads
app.use(
  "/uploads/pdfs",
  express.static(pdfDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }
    },
  })
);

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send("Server Running ✅");
});

// ✅ Routes
app.use('/api', userRouter);
app.use('/api', courseRoutes);
app.use('/api', adminRoutes);
app.use("/api", pdfRoutes);
app.use("/api",testimonialRoutes)
app.listen(port, () => {
  connectdb();
  console.log(`✅ Server running at http://localhost:${port}`);
});

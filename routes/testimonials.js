import express from "express";
import {
  addTestimonial,
  getAllTestimonials,
  getTestimonialsByCourse,
  getTopTestimonial,
  deleteTestimonial,
  getTopFourTestimonials
} from "../controllers/testimonial.js";
import { isAuth,isAdmin } from "../middlewares/isAuth.js"; // ensure you have auth middleware

const router = express.Router();

// User: add a testimonial
router.post("/testimonials", isAuth, addTestimonial);

// Get all (admin)
router.get("/testimonials", isAuth, isAdmin, getAllTestimonials);

// Get testimonials for one course
router.get("/testimonials/course/:id", getTestimonialsByCourse);

// Get top testimonial (Home page)
router.get("/testimonials/top", getTopTestimonial);
router.get("/testimonials/top4", getTopFourTestimonials);


// Delete testimonial (admin)
router.delete("/testimonials/:id", isAuth, isAdmin, deleteTestimonial);

export default router;

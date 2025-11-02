import { Testimonial } from "../models/Testimonials.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import TryCatch from "../middlewares/tryCatch.js";


// ✅ Add new testimonial
export const addTestimonial = TryCatch(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  const course = await Courses.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const testimonial = await Testimonial.create({
    user: req.user._id,
    course: course._id,
    rating,
    comment,
  });

  res.status(201).json({ message: "Testimonial added successfully", testimonial });
});


// ✅ Get all testimonials (for admin dashboard)
export const getAllTestimonials = TryCatch(async (req, res) => {
  const testimonials = await Testimonial.find()
    .populate("user", "name email")
    .populate("course", "title");
  res.json({ testimonials });
});


// ✅ Get testimonial by course (for course detail page)
export const getTestimonialsByCourse = TryCatch(async (req, res) => {
  const { id } = req.params; // course ID
  const testimonials = await Testimonial.find({ course: id })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ testimonials });
});


// ✅ Get the highest-rated testimonial (for Home page)
export const getTopTestimonial = async (req, res) => {
  try {
    const top = await Testimonial.findOne()
      .sort({ rating: -1, createdAt: 1 })
      .populate({
        path: "user",
        select: "name avatar",
      })
      .populate({
        path: "course",
        select: "title _id image",
      });

    if (!top) {
      return res.status(404).json({ message: "No testimonials yet" });
    }

    res.status(200).json({ testimonial: top });
  } catch (err) {
    console.error("🔥 Error in getTopTestimonial:", err);
    res.status(500).json({
      message: "Server error while fetching top testimonial",
      error: err.message,
    });
  }
};
// ✅ Get Top 4 Testimonials (for homepage carousel/grid)
export const getTopFourTestimonials = async (req, res) => {
  try {
    const topTestimonials = await Testimonial.find()
      .sort({ rating: -1, createdAt: 1 }) // highest rating first, then earliest
      .limit(4)
      .populate({
        path: "user",
        select: "name avatar",
      })
      .populate({
        path: "course",
        select: "title _id image",
      });

    if (!topTestimonials || topTestimonials.length === 0) {
      return res.status(404).json({ message: "No testimonials found" });
    }

    res.status(200).json({ testimonials: topTestimonials });
  } catch (err) {
    console.error("🔥 Error in getTopFourTestimonials:", err);
    res.status(500).json({
      message: "Server error while fetching top testimonials",
      error: err.message,
    });
  }
};


// ✅ Delete testimonial (admin only)
export const deleteTestimonial = TryCatch(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) return res.status(404).json({ message: "Not found" });

  await testimonial.deleteOne();
  res.json({ message: "Testimonial deleted successfully" });
});

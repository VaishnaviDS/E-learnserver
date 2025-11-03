import TryCatch from "../middlewares/tryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from 'fs';
import { promisify } from "util";
import fs from 'fs';
import { User } from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { Testimonial } from "../models/Testimonials.js";



// admin creating course
export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, image } = req.body;

  if (!image) return res.status(400).json({ message: "Image URL missing" });

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image, // direct Cloudinary URL
    duration,
    price,
  });

  res.status(201).json({ message: "Course created successfully" });
});


// add lecture (PDF or video)
export const addLectures = TryCatch(async (req, res) => { 
  const course = await Courses.findById(req.params.id); 
  if (!course) return res.status(404).json({ message: "No course with this ID" }); 
  
  const { title, description, file, fileType } = req.body; 
  if (!file) return res.status(400).json({ message: "File URL missing" }); 
  
  const lecture = await Lecture.create({ 
    title, 
    description, 
    file,  // Cloudinary URL 
    fileType,  // "video" or "pdf" 
    course: course._id, 
  }); 
  
  res.status(201).json({ message: "Lecture added successfully", lecture }); 
});


// delete lecture
export const deleteLec = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  if (lecture.file) {
    try {
      // extract public_id from URL
      const parts = lecture.file.split("/");
      const publicIdWithExt = parts[parts.length - 1]; // e.g. abc123.mp4
      const publicId = publicIdWithExt.split(".")[0];  // abc123

      await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      console.log("Lecture file deleted from Cloudinary");
    } catch (err) {
      console.log("Cloudinary delete error:", err.message);
    }
  }

  await lecture.deleteOne();
  res.json({ message: "Lecture deleted successfully" });
});


// delete course and all its lectures + files
export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.file) {
        try {
          const parts = lecture.file.split("/");
          const publicIdWithExt = parts[parts.length - 1];
          const publicId = publicIdWithExt.split(".")[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
          await Testimonial.deleteMany({ course: course._id });
        } catch (err) {
          console.log("Error deleting lecture:", err.message);
        }
      }
    })
  );

  if (course.image) {
    try {
      const parts = course.image.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
      console.log("Error deleting course image:", err.message);
    }
  }

  await Lecture.deleteMany({ course: course._id });
  await course.deleteOne();
  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({ message: "Course and lectures deleted successfully" });
});


// update lecture
export const updateLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  const { title, description } = req.body;
  if (title) lecture.title = title;
  if (description) lecture.description = description;

  if (req.file) {
    // Delete old file from Cloudinary
    try {
      const parts = lecture.file.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      console.log("Old lecture file deleted");
    } catch (err) {
      console.log("Error deleting old file:", err.message);
    }

    // Save new uploaded file (req.file.path is Cloudinary URL)
    const mime = req.file.mimetype;
    if (mime.startsWith("video/")) lecture.fileType = "video";
    else if (mime === "application/pdf") lecture.fileType = "pdf";
    else return res.status(400).json({ message: "Unsupported file type" });

    lecture.file = req.file.path;
  }

  await lecture.save();
  res.status(200).json({ message: "Lecture updated successfully", lecture });
});


// admin stats
export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = await Courses.countDocuments();
  const totalLectures = await Lecture.countDocuments();
  const totalUser = await User.countDocuments();

  const stats = {
    totalCourses,
    totalLectures,
    totalUser,
  };

  res.json({ stats });
});
export const updateCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const { title, description, category, createdBy, duration, price, image } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (createdBy) course.createdBy = createdBy;
  if (duration) course.duration = duration;
  if (price) course.price = price;

  if (image) {
    // delete old from cloudinary
    try {
      const parts = course.image.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
      console.log("Cloudinary delete error:", err.message);
    }
    course.image = image;
  }

  await course.save();
  res.status(200).json({ message: "Course updated successfully", course });
});

export const getAlluser=TryCatch(async (req,res)=>{
  const users=await User.find({_id:{$ne:req.user._id}}).select(
    "-password"
  )
  res.json({users})
})
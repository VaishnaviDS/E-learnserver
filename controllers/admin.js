import TryCatch from "../middlewares/tryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from 'fs';
import { promisify } from "util";
import fs from 'fs';
import { User } from "../models/User.js";

// admin creating course
export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price } = req.body;
  const image = req.file;

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
  });

  res.status(201).json({ message: "Course created successfully" });
});

// add lecture (PDF or video)
export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "No course with this ID" });

  const { title, description } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const mime = file.mimetype;
  let fileType = "";
  let message = "";

  if (mime.startsWith("video/")) {
    fileType = "video";
    message = "Lecture video uploaded successfully";
  } else if (mime === "application/pdf") {
    fileType = "pdf";
    message = "Notes PDF uploaded successfully";
  } else {
    return res.status(400).json({ message: "Unsupported file type" });
  }

  const lecture = await Lecture.create({
    title,
    description,
    file: file.path,
    fileType,
    course: course._id,
  });

  res.status(201).json({ message, lecture });
});


// delete lecture
export const deleteLec = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  if (lecture.file) {
    await promisify(fs.unlink)(lecture.file);
    console.log("Lecture file deleted");
  }

  await lecture.deleteOne();
  res.json({ message: "Lecture deleted" });
});

// delete course and all its lectures + files
export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.file) {
        await promisify(fs.unlink)(lecture.file);
        console.log("Lecture file deleted");
      }
    })
  );

  if (course.image) {
    rm(course.image, () => console.log("Course image deleted"));
  }

  await Lecture.deleteMany({ course: course._id });
  await course.deleteOne();
  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({ message: "Course deleted" });
});

// update lecture
export const updateLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  const { title, description } = req.body;
  if (title) lecture.title = title;
  if (description) lecture.description = description;

  if (req.file) {
    await promisify(fs.unlink)(lecture.file); // delete old file

    const mime = req.file.mimetype;
    if (mime.startsWith("video/")) lecture.fileType = "video";
    else if (mime === "application/pdf") lecture.fileType = "pdf";
    else return res.status(400).json({ message: "Unsupported file type" });

    lecture.file = req.file.path;
  }

  await lecture.save();
  res.status(200).json({ message: "Content updated successfully", lecture });
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

  const { title, description, category, createdBy, duration, price } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (createdBy) course.createdBy = createdBy;
  if (duration) course.duration = duration;
  if (price) course.price = price;

  if (req.file) {
    await promisify(fs.unlink)(course.image); // remove old image
    course.image = req.file.path;
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
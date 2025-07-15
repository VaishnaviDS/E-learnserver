// import mongoose from "mongoose";
// const schema= new mongoose.Schema({
// title:{ type:String ,required:true},
// description:{ type:String ,required:true},
// video:{ type:String ,required:true},
// course:{ type:mongoose.Schema.Types.ObjectId ,ref:"Courses",required:true},
// createdAt:{ type:Date, default:Date.now},
// })
// export const Lecture=mongoose.model("Lecture",schema)

import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file: { type: String, required: true }, // was "video"
  fileType: { type: String, enum: ["video", "pdf"], required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Lecture = mongoose.model("Lecture", schema);

import express from 'express'
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import { addLectures, createCourse, deleteCourse, deleteLec, getAllStats, getAlluser, updateCourse, updateLecture } from '../controllers/admin.js';
import { uploadFiles } from '../middlewares/multer.js';

const router=express.Router()
router.post("/course/new",isAuth,isAdmin,uploadFiles,createCourse)
router.post("/course/:id",isAuth,isAdmin,uploadFiles,addLectures) //from course id creating lectures
router.delete("/lecture/:id",isAuth,isAdmin,deleteLec)
router.delete("/course/:id",isAuth,isAdmin,deleteCourse)
router.get("/stats",isAuth,isAdmin,getAllStats)
router.put("/lecture/:id", isAuth, isAdmin, uploadFiles, updateLecture);
router.put("/course/:id", isAuth, isAdmin, uploadFiles, updateCourse);
router.get("/users",isAuth,isAdmin,getAlluser)
export default router;
import express from 'express'
import { checkout, fetchLectures, fetchSingleLec, getAllcourses, getMyCourses, getSinglecourse, paymentVerify } from '../controllers/course.js';
import { isAuth } from '../middlewares/isAuth.js';

const router=express.Router()
router.get("/course/all",getAllcourses)
router.get("/course/:id",getSinglecourse)
router.get("/lectures/:id",isAuth,fetchLectures)
router.get("/lecture/:id",isAuth,fetchSingleLec)
router.get("/mycourse",isAuth,getMyCourses)
router.post("/course/checkout/:id",isAuth,checkout)
router.post("/verification/:id",isAuth,paymentVerify)
export default router;
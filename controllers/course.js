import TryCatch from "../middlewares/tryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { instance } from "../index.js";
import crypto from "crypto"
import { Payment } from "../models/Payment.js";

export const getAllcourses=TryCatch(async(req,res)=>{
    const courses=await Courses.find();
 // or req.user._id if you store it that way
    res.json({ courses})
})

export const getSinglecourse=TryCatch(async(req,res)=>{
    const course=await Courses.findById(req.params.id)
    res.json({course})
})

export const fetchLectures=TryCatch(async(req,res)=>{
    const lectures=await Lecture.find({course:req.params.id})
    const user=await User.findById(req.user._id)

    if(user.role==="admin")
        return res.json({lectures})
    if(!user.subscription.includes(req.params.id))
        return res.status(403).json({ message:"You have not subscribed to this course" })
    res.json({lectures})
})

export const fetchSingleLec=TryCatch(async(req,res)=>{
    const lecture=await Lecture.findById(req.params.id)
    const user=await User.findById(req.user._id)

    if(user.role==="admin")
        return res.json({lecture})
    if(!user.subscription.includes(lecture.course)) //used includes because subscription is an array
    //lectures.course becoz req.params.id is course id
        return res.status(403).json({ message:"You have not subscribed to this course" })
    res.json({lecture})
})

export const getMyCourses=TryCatch(async(req,res)=>{
    const courses=await Courses.find({_id:req.user.subscription})
    res.json({ courses })
})

export const checkout=TryCatch(async(req,res)=>{
    const user=await User.findById(req.user._id)
    const course=await Courses.findById(req.params.id)
    if(user.subscription.includes(course._id)) return res.status(400).json({message:"You already have this course"})
    const options={
amount:Number(course.price*100),
currency:"INR",
}
const order=await instance.orders.create(options)
res.status(201).json({
    order,course,
})
})

//payment verification
export const paymentVerify=TryCatch(async(req,res)=>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body
    const body=razorpay_order_id + "|" +razorpay_payment_id
    const expectedSignature=crypto.createHmac("sha256",process.env.Razorpay_Secret).update(body).digest("hex")
const isAuthentic=  expectedSignature===razorpay_signature; //here we create a signature and we hash it using 
if(isAuthentic){                                              //cryptography hash functions we uses the body to generate a hash value and we return in hex format
await Payment.create({                                        //here it checks if it is authentic or not with a signature recieved from razorpay
    razorpay_order_id,razorpay_payment_id,razorpay_signature//this we will send to user 
})
const user=await User.findById(req.user._id)
const course=await Courses.findById(req.params.id)
user.subscription.push(course._id)
await user.save()
res.status(200).json({ message:"Course purchased "})
}
else return res.status(400).json({message:"Payment failed"})

})
import { User } from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import sendMail, { sendForgotemail } from "../middlewares/sendMail.js"
import TryCatch from "../middlewares/tryCatch.js"
export const register= TryCatch(async(req,res)=>{
            const{email,name,password}=req.body
        let user=await User.findOne({ email})
        if(user) return res.status(400).json({message:"User aldready exist"})
            const hashPassword=await bcrypt.hash(password,10)
            user={
        name,
        email,
        password:hashPassword,
        }
        const otp =Math.floor(Math.random()*1000000) //6 digit otp to get in response thats why 1000000
        const activationToken=jwt.sign({user,otp},process.env.SecretCode,{ 
            expiresIn:'5m', 
        })
        const data={
            name,otp,
        }
        await sendMail( email,'E-learning',data)
        res.status(200).json({message:"Otp send to ur mail",activationToken})
})
export const verifyUser=TryCatch(async(req,res)=>{
    const {otp,activationToken}=req.body;
    const verify=jwt.verify(activationToken,process.env.SecretCode)
    if(!verify) return res.status(400).json({message:"Otp expired"})
    if(verify.otp!=otp) return res.status(400).json({message:"Wrong Otp"})

    await User.create({
        name:verify.user.name,
        email:verify.user.email,
        password:verify.user.password,
    })
    res.json({message:"User registered"})
})

export const login=TryCatch(async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email})
    if(!user) return res.status(400).json({message:"user dont exist"})
        const match_password=await bcrypt.compare(password,user.password)
    if(!match_password) return res.status(400).json({message:"wrong password"})
    const token=jwt.sign({_id:user._id},process.env.SecretCode2,{
expiresIn:"15d",
})
res.json({message:`Welcome ${user.name}`,token,user})
})

export const myProfile=TryCatch(async(req,res)=>{
const user =await User.findById(req.user._id)
res.json({user})
})
export const forgotPassword=TryCatch(async(req,res)=>{
    const {email}=req.body
    const user=await User.findOne({email})

    if(!user) return res.status(404).json({message:"No user with this email"})
        const token=jwt.sign({email},process.env.Forgot_Secret)
    const data={email,token}
    await sendForgotemail("E learning",data)
    user.resetPasswordExpire=Date.now()+5*60*1000
    await user.save();
    res.json({message:"Reset Password link is send to your mail"})
})
export const resetPassword=TryCatch(async(req,res)=>{
    const decodeData=jwt.verify(req.query.token,process.env.Forgot_Secret)
    const user=await User.findOne({email:decodeData.email})
    if(!user) return res.status(404).json({message:"No user with this email"})
        if (user.resetPasswordExpire===null)
            return res.status(400).json({message:"Token expired"})
    if(user.resetPasswordExpire<Date.now()){
            return res.status(400).json({message:"Token expired"})
    }
    const password=await bcrypt.hash(req.body.password,10)
    user.password=password
    user.resetPasswordExpire=null
    await user.save();
    res.json({message:"Password reset"})
})


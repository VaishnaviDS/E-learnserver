import express from 'express'
import dotenv from 'dotenv'
import { connectdb } from './Database/db.js';
import userRouter from './routes/user.js'
import courseRoutes from './routes/course.js'
import adminRoutes from './routes/admin.js'
import Razorpay from 'razorpay'
import cors from 'cors'
import path from 'path'
dotenv.config();

export const instance=new Razorpay({
    key_id:process.env.Razorpay_Key,
    key_secret: process.env.Razorpay_Secret,
})

const app=express();
app.use(express.json())
app.use(cors()) //use for getting backend api for frontend

// app.use('/uploads',express.static('uploads')) //use for uploading image
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    }
  }
}));

const port=process.env.PORT;
app.get('/',(req,res)=>{
    res.send("Server")
})
app.use('/api',userRouter)
app.use('/api',courseRoutes)
app.use('/api',adminRoutes)

app.listen(port,()=> {
    connectdb();
    console.log(`server is running at ${port}`)
})
import express from 'express'
import { forgotPassword, login, myProfile, register, resetPassword, verifyUser } from '../controllers/user.js'
import { isAuth } from '../middlewares/isAuth.js'
const router =express.Router()

router.post('/user/register',register)
router.post('/user/verify',verifyUser)
router.post('/user/login',login)
router.get('/user/me',isAuth,myProfile)
router.post('/user/forgot',forgotPassword)
router.post('/user/reset',resetPassword)
export default router;
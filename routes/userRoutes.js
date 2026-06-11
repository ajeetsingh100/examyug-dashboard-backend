const express=require("express")
const router=express.Router();
const {otp,login,signup,changePassword, showAllUser, verifyOTP, getUserDetails,changeUserDetails,deleteUser, sendOTPForPasswordChange, changeUserPassword}=require("../controller/Auth")

const {resetPasswordToken,resetPassword}=require('../controller/ResetPasword')

router.post('/login',login)
router.post('/signup',signup)
router.post('/sendotp',otp)
router.post('/change-password',changePassword)
router.post('/reset-password-token',resetPasswordToken)
router.post('/reset-password',resetPassword)
router.get('/get-all-users',showAllUser)
router.post('/send-otp-pass-change',sendOTPForPasswordChange)
router.post('/verify-otp',verifyOTP)
router.post('/change-user-password',changeUserPassword)
router.post('/get-user-details',getUserDetails)
router.post('/edit-user-details',changeUserDetails)
router.delete('/delete-user',deleteUser)
module.exports=router
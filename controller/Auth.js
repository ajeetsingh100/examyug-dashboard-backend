const otpGenerator=require('otp-generator')
const User=require("../models/User")
const OTP=require('../models/Otp')
const bcrypt=require("bcrypt")
//const Profile=require('../models/Profile')
const jwt=require("jsonwebtoken")
const mailsender = require('../utilities/mail')
const Otp = require('../models/Otp')
require('dotenv').config()

// **********************************************
//                  SEND OTP
// **********************************************
exports.otp=async(req,res)=>{
   try {    
    //FETCHING EMAIL FROM REQUEST BODY
     const email=req.body.email
     //CHECKING IF USER ALREADY EXIST
     const userExist= await User.findOne({email})
     if(userExist){
         return res.status(401).json({
             success:false,
             message:"email is already registered"
         })
     }
     //GENERATING OTP
     let otp=otpGenerator.generate(6,{
         lowerCaseAlphabets:false,
         upperCaseAlphabets:false,
         specialChars:false
     })
     //CHECKING IF THE GENERATED IS UNIQUE
     let uniqueOTP=await OTP.findOne({otp})
     while(uniqueOTP){
         otp=otpGenerator.generate(6,{
             upperCaseAlphabets:false,
             lowerCaseAlphabets:false,
             specialChars:false
         })
         
         uniqueOTP=await OTP.findOne({otp})
     }
     //SAVING OTP IN DB AND SENDING OTP TO EMAIL(USING PRE MIDDLEWARE) 
     const saved_otp=await OTP.create({email,otp})
     return res.status(200).json({
            success:true,
            message:"otp send successfully"
     })
   } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while sending otp",
            error:error.message
        })
   }

}
// **********************************************
//                  SIGN UP
// **********************************************

exports.signup= async (req,res)=>{
   try {
     //FETCHING DATA FROM REQUEST BODY
     const {firstName,lastName,email,phone_no,gender,password,confirmPassword,role,otp}=req.body
     console.log(req.body)
     //CHECKING FOR MISSING FIELD
     if(!firstName||!lastName||!email||!confirmPassword||!password||!otp||!phone_no||!gender){
          return res.status(401).json({
             success:false,
             message:"all field must filled "
         })
     }    
     
     //CHECKING PASSWORD AND CONFIRM PASSWORD IS SAME
     if(password!==confirmPassword){
         return res.status(401).json({
             success:false,
             message:"password and confirm password doesn't match"
         })
     }
     //FETCHING LATEST OTP FROM DB
     const recentOtp= await OTP.findOne({email}).sort({createdAt:-1})
     console.log('recent otp:',recentOtp)
     //CHECKING IF OTP NOT FOUND
     if(!recentOtp){
        return res.status(401).json({
            success:false,
            message:"No otp found"
        })
     }
     //CHECKING USER ENTERTED OTP IS SAME AS GENERATED ONE
     if(parseInt(otp)!==recentOtp.otp){
        return res.status(401).json({
                success:false,
                message:"entered otp is incorrect"
            })
     }
     //HASHING THE PASSWORD
     let hashPassword
    try {
      hashPassword= await bcrypt.hash(password,10)
    } catch (error) {
      console.log("error while hashing the password")
    }
    //CREATING USER PROFILE(MODEL=PROFILE)
    // const userProfile=await Profile.create({
    //     gender:null,
    //     dateOfBirth:null,
    //     contactNo:null,
    //     about:null
    // })
    //SAVING RECORD TO DB(MODEL-USER)
    const savedUser= await User.create({
     firstName,
     lastName,
     email,
     password:hashPassword,
     role,
     phone_no,
     gender,
     image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })
    //SENDING SUCCESS RESPONSE
    return res.status(200).json({
     success:true,
     message:'user record is created',
     data:savedUser
    })
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:'unable to register user',
        data:error.message
    })
   }
}
// **********************************************
//                  LOGIN 
// **********************************************
exports.login= async (req,res)=>{
    try {
        //GET DATA FROM REQ BODY
        const {email,password}=req.body
       
        //DATA VALIDATION
        if(!email||!password){
            return res.status(401).json({
                message:"all field must be filled"
            })
        }
        //CHECKING IF USER EXIST OR NOT
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"user not exist"
            })
        }
        //COMPARING PASSWORD
        const match=await bcrypt.compare(password,user.password)
        if(!match){
            return res.status(403).json({
                message:"invalid credentials"
            })
        }
        //GENERATE TOKEN
        const payload={
            email:user.email,
            id:user._id,
            role:user.role
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"10h"
        })
        //CREATE TOKEN AND SEND IT USING COOKIE

        return res.cookie("token", token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                    })
                    .status(200)
                    .json({
                    success:true,
                    message:"user logged in successfully",
                    token,
                    user
                    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            message:error.message
        })
    }
}
// **********************************************
//                  CHANGE PASSWORD
// **********************************************
exports.changePassword=async(req,res)=>{

    //GET OLD PASSWORD,NEWPASSWORD,CONFIRM PASSWORD
     try {
        const {newPass,confirmPass}=req.body
        const user=req.user
       //VALIDATION
       if(!newPass||!confirmPass){
           return res.json({
               message:"all field must be filled"
           })
       }
       //CHECKING ENTERED PASSWORD AND CONFIRM PASSWORD IS SAME OR NOT
       if(newPass!==confirmPass){
           return res.json({
               message:"new password and confirm password doesn't match"
           })
       }
       //HASHING THE PASSWORD
       let hashPass
       try {
            hashPass=await bcrypt.hash(newPass,10)
       } catch (error) {
           console.log(error.message)
       }
       //DECODING THE TOKEN
       
       //FETCHING THE USER DETAILS
       const updatedUser=await User.findOneAndUpdate({email:user.email},{$set:{password:hashPass}},{new:true}).populate('additionalDetails')
       //SENDING THE MAIL TO USER
       // mailsender(user.email,"change password request",`congratulation your password of
       //                                              studynotion account has been changed`)
       //RETURNING SUCCESS RESPONSE
       return res.status(200).json({
           message:"password changed successfully!!",
           updatedUser
       })
     } catch (error) {
        return res.status(500).json({
            message:error.message,
            data:error.message
        })
     }
    
}

// **********************************************
//                  SHOW ALL USERS
// **********************************************
exports.showAllUser=async(req,res)=>{
   try {
        let allUsers=await User.find({})
        if(!allUsers){
            return res.status(400).json({
                success:'false',
                message:'no user found including master'
            })
        }
        allUsers=allUsers.filter(user=>user.role!=='super-admin')
        return res.status(200).json({
            success:true,
            message:'all user fetched successfully',
            allUsers
        })
    
   } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
            error:'Internal server error'

        }
    )
   }
}

// **********************************************
//                  VERIFY OTP
// **********************************************
exports.verifyOTP=async(req,res)=>{
    try {
        const OTP=req.body.otp
        const email=req.body.email
        console.log(req.body)
        //INPUT VALIDATION
        if(!OTP){
            return res.status(400).json({
                success:false,
                message:'please enter the OTP'
            })
        }

        const recentOTP=await Otp.findOne({email}).sort({createdAt:-1})
        console.log('recent otp',recentOTP.otp)
        //FETCHING RECENT OTP
        if(!recentOTP){
            return res.status(400).json({
                success:false,
                message:'No otp found'
            })
        }
        //COMPARING ENTERED AND GENERATED OTP
        if(parseInt(OTP)!==recentOTP.otp){
            return res.status(401).json({
                    success:false,
                    message:"entered otp is incorrect"
                })
        }
        //SENDING SUCCESS MESSAGE
        return res.status(200).json({
            success:true,
            message:'otp verified successfully'
        })

    } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message,
                error:'problem in verifying otp'
            })  
        }
}

// ********************************************************
//          SEND OTP FOR PASSWORD VERIFICATION
// ********************************************************
exports.sendOTPForPasswordChange=async(req,res)=>{
    try {
        const email=req.body.email
        console.log(email)
        //INPUT VALIDATION
        if(!email){
            return res.status(400).json({
                success:false,
                messsage:'email is missing'
            })
        }
        const user= await User.find({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:`email doesn't exist`
            })
        }
         //GENERATING OTP
        let otp=otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false
        })
        //CHECKING IF THE GENERATED IS UNIQUE
        let uniqueOTP=await OTP.findOne({otp})
        while(uniqueOTP){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            
            uniqueOTP=await OTP.findOne({otp})
        }
        //SAVING OTP IN DB AND SENDING OTP TO EMAIL(USING PRE MIDDLEWARE) 
        const saved_otp=await OTP.create({email,otp})
        return res.status(200).json({
                success:true,
                message:"otp send successfully"
        })

    } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message,
                error:'unable to send otp for password change'
            })  
        }
}

// **********************************************
//            CHANGE USER PASSWORD
// **********************************************
exports.changeUserPassword=async(req,res)=>{

    //GET OLD PASSWORD,NEWPASSWORD,CONFIRM PASSWORD
     try {
        const {email,newPass,confirmPass}=req.body
       //VALIDATION
       if(!newPass||!confirmPass){
           return res.json({
               message:"all field must be filled"
           })
       }
       //CHECKING ENTERED PASSWORD AND CONFIRM PASSWORD IS SAME OR NOT
       if(newPass!==confirmPass){
           return res.json({
               message:"new password and confirm password doesn't match"
           })
       }
       //HASHING THE PASSWORD
       let hashPass
       try {
            hashPass=await bcrypt.hash(newPass,10)
       } catch (error) {
           console.log(error.message)
       }
       //DECODING THE TOKEN
       
       //FETCHING THE USER DETAILS
       const updatedUser=await User.findOneAndUpdate({email},{$set:{password:hashPass}})
       //SENDING THE MAIL TO USER
       // mailsender(user.email,"change password request",`congratulation your password of
       //                                              studynotion account has been changed`)
       //RETURNING SUCCESS RESPONSE
       return res.status(200).json({
            success:true,
            message:"password changed successfully!!",
       
       })
     } catch (error) {
        return res.status(500).json({
            message:error.message,
            data:error.message
        })
     }
    
}


// **********************************************
//            GET SELECTED USER DETAILS
// **********************************************
exports.getUserDetails=async(req,res)=>{
try {
        const email=req.body.email

        //CHECKING IF USER EXIST
        const user=await User.find({email})

        if(!user){
            return res.status(400).json({
                success:false,
                message:'user not found'
            })
        }
        
        //RETURNING SUCCESS RESPONSE WITH USER DETAILS
        return res.status(200).json({
            success:true,
            message:'user fetched successfully',
            user
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
            error:'error while fetching user detao;'
        })
    }
}

// **********************************************
//            UPDATE USER DETAILS
// **********************************************
exports.changeUserDetails=async(req,res)=>{
  try {
        const userID=req.body.userID
        const updates=JSON.parse(req.body.updates)
        console.log(updates)

        //VALIDATING THE INPUT 
        if(!userID){
            return res.status(400).json({
                success:false,
                message:'userID is missing'
            })
        }

        //CHECKING IF USER EXIST 
        const userDetails = await User.findById(userID)
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:`User doesn't exist`,
            })
        }

        //UPDATE ONLY THOSE FIELD CONTAINED BY UPDATES OBJECT
        if(Object.keys(updates).length!==0){
            for (let key in updates){
                if(updates.hasOwnProperty(key)){
                    userDetails[key]=updates[key]
                }
            }
        }

        //UPDATING THE RECORD IN DB
        await userDetails.save()

        //RETURNING THE SUCCESS MESSAGE
        return res.status(200).json({
            success:true,
            message:'user details updates successfully',
        })

  } catch (error) {

        return res.status(500).json({
            success:false,
            message:error.message,
            error:error
        })
  }
}

exports.deleteUser=async(req,res)=>{
  
    try {
          const {userID}=req.body
          console.log(userID)

        if(!userID){
            return res.status(400).json({
                success:false,
                message:'userID is not found'
            })
        }

        const user= await User.findById(userID)
        
        if(!user){
            return res.status(404).json({
                success:false,
                message:`user doesn't exist`
            })
        }

        await User.findByIdAndDelete(userID)

        return res.status(200).json({
            success:true,
            message:'user deleted successfully'
        })
        
    } catch (error) {
        return res.status(500).json({
        success:false,
        message:error.message,
        error:'unable to delete user b/c internal server error'
        })
    }    
}
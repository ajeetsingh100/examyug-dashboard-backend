const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        
    },
    phone_no:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    gender:
    {
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','book-manager','course-manager'],
        required:true
    },
    resetToken:{
        type:String
    },
    resetTokenExpiryTime:{
        type:Date,
    },
},
{
    timestamps:true
})

module.exports=mongoose.model("User",userSchema)
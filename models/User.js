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
    confirmPassword:{
        type:String, 
      
    },
    resetToken:{
        type:String
    },
    resetTokenExpiryTime:{
        type:Date,
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address"
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],
    books:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Books"
        }
    ]
},
{
    timestamps:true
})

module.exports=mongoose.model("User",userSchema)
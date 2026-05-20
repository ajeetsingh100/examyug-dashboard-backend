const mongoose=require('mongoose')


const addressSchema=new mongoose.Schema({
    house:{
        type:String,
        required:true,
        trim:true
    },
    area:{
        type:String,
        required:true,
        trim:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    country:{
        type:String,
        required:true,        
    },
    pincode:{
        type:String,
        required:true,
        trim:true     
    },
    landmark:{
        type:String,
        trim:true        
    }
})

module.exports=mongoose.model("Address",addressSchema)


const mongoose=require('mongoose')

const courseSchema=new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true,
        trim:true
    },
    courseDescription:{
        type:String,
        required:true,
        trim:true
    },
    categoryName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseCategory",
        required:true,
    },
    // seoKeyword:[{
    //     type:String,
    //     required:true,
    //     trim:true
    // }],
    // tags:[{
    //     type:String,    
    //     trim:true
    // }],
    sellingPrice:{
        type:Number,
        required:true,
        trim:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    featured:{
        type:String,
        enum:['yes','no'],
        required:true,
    },
    maxPrice:{
        type:Number,
        required:true
    },
    newBatch:{
        type:String,
        enum:['yes','no'],
        required:true
    },
    courseDisplay:{
        type:String,
        enum:['yes','no'],
        required:true
    },
    // rank:{
    //     type:Number,        
    // },
    timeDuration:{
        type:String,
        required:true,
    }
},{
    timestamps:true
}

)

module.exports=mongoose.model("Course",courseSchema)
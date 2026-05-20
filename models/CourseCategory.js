const mongoose=require('mongoose')

const courseCategorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        trim:true,
        require:true,
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }]
})

module.exports=mongoose.model("CoursesCategory",courseCategorySchema)
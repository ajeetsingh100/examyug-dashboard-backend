const mongoose=require('mongoose')

const courseCategoriesSchema=new mongoose.Schema({
    categoryTitle:{
        type:String,
        trim:true,
        require:true,
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }]
})

module.exports=mongoose.model("CourseCategories",courseCategoriesSchema)
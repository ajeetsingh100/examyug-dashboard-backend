const CourseCategory=require("../models/CourseCategory")

exports.addCategory=async(req,res)=>{
    const {categoryName}=req.body

    try {
        /*------VALIDATING INPUTS-------*/
        if(!categoryName.trim()){
            return res.status(400).json({
                success:false,
                message:"Please fill all the required fields"
            })
        }

        /*------SAVING CATEGORY IN DB-------*/
        const savedCategory=await CourseCategory.create({
            categoryName
        })

        /*-------RETURNING SUCCESS RESPONSE---------*/
        return res.status(200).json({
            success:true,
            message:'Category is created successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong',
            error:error.message
        })
    }

}


exports.getAllCategory=async(req,res)=>{
   try {
        const allCategories=await CourseCategory.find({})
        return res.status(200).json({
            success:true,
            message:"All category fetch successfully",
            allCategories
        })
   } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong',
            error:error.message,
            
        })
   }
}
const CourseCategories=require("../models/CourseCategories")

exports.addCategory=async(req,res)=>{
    const {categoryTitle}=req.body

    try {
        /*------VALIDATING INPUTS-------*/
        if(!categoryTitle.trim()){
            return res.status(400).json({
                success:false,
                message:"Please fill all the required fields"
            })
        }

        /*------SAVING CATEGORY IN DB-------*/
        const savedCategory=await CourseCategories.create({
            categoryTitle
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
        const allCategories=await CourseCategories.find({}).populate('courses')
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

exports.paginatedCategories=async(req,res)=>{
    const page=parseInt(req.query.page)||1
    const limit=parseInt(req.query.limti)||5
    const please_skip=(page-1)*limit

   try {
         let allCategories=await CourseCategories.find({}).populate('courses').skip(please_skip).limit(limit).lean()
         const totalDocuments=await CourseCategories.countDocuments({})
         allCategories=allCategories.map((category,index)=>{ return {serial_no:(page-1)*limit+index+1,...category}})
         console.log(allCategories)
    
         const totalPages=Math.ceil(totalDocuments/limit)
    
         return res.status(200).json({
            success:true,
            allCategories,
            totalPages,
            message:'all paginated categories fetched successfully'
        
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error:error.message
        })
        
    }


}
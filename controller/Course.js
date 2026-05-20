const Course=require('../models/Course')
const {uploadToCloudinary}=require('../utilities/fileUploaderCloudinary')

/*--------FUNCTION TO HANDLE ADD course----------*/
exports.addCourse=async (req,res)=>{
    const {courseTitle, courseDescription,categoryName,timeDuration, maxPrice, sellingPrice,courseDisplay,
        featured,newBatch
    }= req.body
    const sp=Number(sellingPrice)
    const mrp=Number(maxPrice)
    console.log('add course',req.body)
    const {thumbnail}=req.files
    try {         
    /*------VALIDATING INPUTS---------*/
        /*------QUERY RELATED FOR MAXPRICE AND SELLING PRICE RELATED O(ZERO)*/
        if(!courseTitle.trim()||!courseDescription.trim()||!categoryName.trim()
            ||!timeDuration.trim()||!featured||!newBatch||!courseDisplay)
        {   
            return res.status(400).json({
                success:false,
                message:'Please fill all the required fields'
            })
        }

        /*------HANDLING SELLING PRICE OR MAX PRICE IF EMPTY------*/
        if(!sellingPrice.trim()||!maxPrice.trim()){
            return res.status(400).json({
                success:false,
                message:'Please fill all the required fields'
            })
        }

        /*------HANDLING SELLING PRICE OR MAX PRICE IS ZERO------*/
        if(sp===0||mrp===0){
             return res.status(400).json({
                success:false,
                message:"selling price or max price can't be zero"
            })
        }

        /*------VALIDATING PRICING IS OF NUMBER TYPE------*/
        if(!Number.isFinite(sp)||!Number.isFinite(mrp)){
            return res.status(400).json({
                success:false,
                message:'MRP and Selling price must be number type'
            })
        }

        /*------HANDLING NEGATIVE PRICING------*/
         if(mrp<0||sp<0){
             return res.status(400).json({
                success:false,
                message:"selling price or max price can't be negative"
            })
        }

        /*------HANDLING SELLING PRICE IS GREATER THAN MAX PRICE------*/
        if(sp>mrp){
            return res.status(400).json({
                success:false,
                message:'selling price must be less than max price'
            })
        }       
        
        /*------VALIDATING DEMO-PDF AND THUMBNAIL------*/
        if(!thumbnail){
            return res.status(400).json({
                success:false,
                message:"Either demoLink or course thumbnail is missing"
            })
        }

     /*------STORING THUMBNAIL AND DEMO PDF LINK IN CLOUDINARY---------*/
        console.log('before uploading file')
        try{
            const saved_thumbnail=await uploadToCloudinary(thumbnail,'examyug24/course_img','image',90,250,400)
        }
        catch(error){
            console.log('cloudinary error',error)
        }
        console.log('data is saved to cloudinary')

     /*------ADDING course IN DB---------*/
        const savedcourse= await Course.create({
            courseTitle,
            courseDescription,        
            maxPrice,
            categoryName,
            sellingPrice,
            featured:featured,
            newBatch:newBatch,
            courseDisplay:courseDisplay,
            timeDuration,
            thumbnail:saved_thumbnail.secure_url
        })

    /*------RETURNING SUCCESS RESPONSE TO CLIENT---------*/
        return res.status(200).json({
            success:true,
            message:'course added successfully',
            course:savedcourse
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            message:'Something went wrong'
        })
    }
}   

/*--------FUNCTION TO HANDLE EDIT course DETAILS----------*/
exports.editcourseDetails=async(req,res)=>{

}

/*--------FUNCTION TO HANDLE DELETE course----------*/
exports.deletecourse=async(req,res)=>{
    
}

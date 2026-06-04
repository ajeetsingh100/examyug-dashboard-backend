const Course=require('../models/Course')
const CourseCategories=require('../models/CourseCategories')
const {uploadToCloudinary}=require('../utilities/fileUploaderCloudinary')

/*--------FUNCTION TO HANDLE ADD course----------*/
exports.addCourse=async (req,res)=>{
     try { const {courseTitle, courseDescription,categoryID,timeDuration, maxPrice, sellingPrice,courseDisplay,
        featured,newBatch
    }= req.body
    const sp=Number(sellingPrice)
    const mrp=Number(maxPrice)
    console.log('add course',req.body)
    const {thumbnail}=req.files
           
    /*------VALIDATING INPUTS---------*/
        /*------QUERY RELATED FOR MAXPRICE AND SELLING PRICE RELATED O(ZERO)*/
        if(!courseTitle.trim()||!courseDescription.trim()||!categoryID.trim()
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
        const saved_thumbnail=await uploadToCloudinary(thumbnail,'examyug24/course_img','image',90,250,400)        
        console.log('data is saved to cloudinary')

     /*------ADDING course IN DB---------*/
        const savedcourse= await Course.create({
            courseTitle,
            courseDescription,        
            maxPrice,
            category:categoryID,
            sellingPrice,
            featured:featured,
            newBatch:newBatch,
            courseDisplay:courseDisplay,
            timeDuration,
            thumbnail:saved_thumbnail.secure_url
        })
        console.log(savedcourse._id)
        await CourseCategories.findByIdAndUpdate({_id:categoryID},{$push:{courses:savedcourse._id}})

        
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
            message:error.message
        })
    }
}   

/*--------FUNCTION TO HANDLE EDIT course DETAILS----------*/
exports.editcourseDetails=async(req,res)=>{
    try {
      const courseID= req.body.courseID
      const updates=JSON.parse(req.body.updates)
     
      const course = await Course.findById(courseID)
      
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnail
        const image = await uploadToCloudinary(thumbnail,'examyug24/course_img','image',90,250,400)
        course.thumbnail = image.secure_url
      }
  
      // Update only the fields that are present in the request body
     if (Object.keys(updates).length!==0) {
       for (const key in updates) {
         if (updates.hasOwnProperty(key)) {
           course[key] = updates[key]
         }
       }
     }  
      await course.save()
  
  
      res.json({
        success: true,
        message: "Course updated successfully",
        //updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  
}

/*--------FUNCTION TO HANDLE DELETE course----------*/
exports.deleteCourse=async(req,res)=>{
    
}

exports.getAllCourses=async(req,res)=>{
    try {
        const page=parseInt(req.query.page)
        const limit=parseInt(req.query.limit)
        const please_skip=(page-1)*limit

        const totalDocument=await Course.countDocuments({})
        let allCourses=await Course.find({}).populate('category').collation({ locale: 'en' }).sort({courseTitle:1}).skip(please_skip).limit(limit).lean()
        if(allCourses.length===0){
            return res.status(200).json({
                success:false,
                message:'No course is added yet',
                allCourses
            })
        }
        allCourses=allCourses.map((course,index)=>{return {serial_no:(page-1)*limit + index+1,...course}})
        const totalPages=Math.ceil(totalDocument/limit)
        return res.status(200).json({
            success:true,
            message:'all courses fetched successfully',
            allCourses,
            totalPages
        })       
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Error while fetching all courses',
            error:error.message
        })
    }
}

exports.searchCourse=async(req,res)=>{
    const keyword=req.query.keyword
    const page=parseInt(req.query.page)
    const limit=parseInt(req.query.limit)
    const please_skip=(page-1)*limit

    try {
          const totalDocuments=await Course.countDocuments({courseTitle:{
            $regex:keyword,
            $options:'i'
         }})

        let courses=await Course.find({courseTitle:{
            $regex:keyword,
            $options:'i'
        }}).populate('category').skip(please_skip).limit(limit).lean()

        
        if(courses.length===0){
            res.status(200).json({
                success:false,
                message:'No courses found',
                courses:[]
            })
        }
        courses=courses.map((course,index)=>{return {serial_no:(page-1)*limit+index+1,...course}})

        const totalPages=Math.ceil(totalDocuments/limit)
        return res.status(200).json({
            success:true,
            message:'courses fetched successfully',
            totalDocuments,
            totalPages,
            courses
        })

    } catch (error) {
         return res.status(200).json({
            success:false,
            message:'Internal Server Error',
            error:error.message
        })
    }

}

exports.searchByCategory=async(req,res)=>{
    console.log(req.query)
    const keyword=req.query.keyword
    const page=parseInt(req.query.page)
    const limit=parseInt(req.query.limit)
    const please_skip=(page-1)*limit

    try {
        const category=await CourseCategories.findById({_id:keyword})
        const totalDocuments=category.courses.length

        const selectedCategoryCourse=await CourseCategories.find({_id:keyword}).populate({
            path:'courses',
            populate:{path:'category'},
            options:{
                sort:{courseTitle:1},
                skip:please_skip,
                limit:limit
            }

        }).lean()
        const courses=selectedCategoryCourse[0].courses.map((course,index)=>{return {serial_no:(page-1)*limit+index+1,...course}})


        if(selectedCategoryCourse[0].courses.length===0){
            res.status(200).json({
                success:false,
                message:'No courses found',
                courses:[]
            })
        }

        const totalPages=Math.ceil(totalDocuments/limit)
        return res.status(200).json({
            success:true,
            message:'courses fetched successfully',
            totalDocuments,
            totalPages,
            courses
        })

    } catch (error) {
         return res.status(200).json({
            success:false,
            message:'Internal Server Error',
            error:error.message
        })
    }
}

exports.getCourse=async(req,res)=>{
   try {
         const courseID=req.body.courseID
         console.log(courseID)
         const course=await Course.findById(courseID).populate('category')
         
         if(!course){
            return res.status(404).json({
                success:false,
                messsage:'course not found'
            })
         }

         return res.status(200).json({
            success:true,
            message:'course fetched successfull',
            course
         })
   } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error:error.message
        })
   }
    
}
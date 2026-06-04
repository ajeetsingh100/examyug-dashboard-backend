const Book = require("../models/Book")
const BookCategories = require("../models/BookCategories")
const Bookset=require('../models/Bookset')
const { uploadToCloudinary } = require("../utilities/fileUploaderCloudinary")

exports.createBookset=async(req,res)=>{
    try{const {booksetTitle, booksetDescription, categoryID}=req.body
    const sp=Number(req.body.sellingPrice)
    const mrp=Number(req.body.maxPrice)
    const {thumbnail}=req.files
    const bookList=JSON.parse(req.body.bookList)

    if(!booksetTitle.trim()||!booksetDescription.trim()||!categoryID.trim()){
        return res.status(400).json({
            success:false,
            message:'all fields are required'
        })
    }
    if(bookList.length==0){
        return res.status(400).json({
            success:false,
            message:'cannot create a bookset with empty books'
        })
    }
    if(bookList.length<2){
        return res.status(400).json({
            success:false,
            message:'cannot create a bookset with 1 book, atleast add 2 books'
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
                message:"Either demoLink or book thumbnail is missing"
            })
        }
        /*------VALIDATING OBJECT IDS THAT THEY EXIST OR NOT IN BOOK COLLECTION------*/
        const count=await Book.countDocuments({_id:{$in:bookList}})
        if(count!==bookList.length){
            return res.status(400).json({
                success:false,
                message:'books not found'
            })
        }
        
        const saved_thumbnail=await uploadToCloudinary(thumbnail,'examyug24/bookset_img','image',90,250,400)
        

        const savedBookset=await Bookset.create({
            booksetTitle,
            booksetDescription,
            sellingPrice:sp,
            maxPrice:mrp,
            category:categoryID,
            bookList,
            thumbnail:saved_thumbnail.secure_url
        })

    return res.status(200).json({
        success:true,
        message:'bookset created successfully'
    
    })}catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:error.message,
        })
    }
}
exports.getAllBooksets=async(req,res)=>{
     try {
            const page=parseInt(req.query.page)
            const limit=parseInt(req.query.limit)
            const please_skip=(page-1)*limit
    
            const totalDocument=await Bookset.countDocuments({})
            let allBooksets=await Bookset.find({}).populate('category').populate({
                path:'bookList',
                populate:{
                    path:'category'
                }
            }).collation({ locale: 'en' }).sort({booksetTitle:1}).skip(please_skip).limit(limit).lean()
            if(allBooksets.length===0){
                return res.status(200).json({
                    success:false,
                    message:'No bookset is added yet',
                    allBooksets
                })
            }
            allBooksets=allBooksets.map((bookset,index)=>{return {serial_no:(page-1)*limit + index+1,...bookset}})
            const totalPages=Math.ceil(totalDocument/limit)
            return res.status(200).json({
                success:true,
                message:'all courses fetched successfully',
                allBooksets,
                totalPages
            })       
            
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message,
                error:error.message
            })
        }

}
exports.searchBookset=async(req,res)=>{
     const keyword=req.query.keyword
        const page=parseInt(req.query.page)
        const limit=parseInt(req.query.limit)
        const please_skip=(page-1)*limit
    
        try {
              const totalDocuments=await Bookset.countDocuments({booksetTitle:{
                $regex:keyword,
                $options:'i'
             }})
    
            let booksets=await Bookset.find({booksetTitle:{
                $regex:keyword,
                $options:'i'
            }}).populate('category').populate('bookList').skip(please_skip).limit(limit).lean()
    
            
            if(booksets.length===0){
                res.status(200).json({
                    success:false,
                    message:'No courses found',
                    booksets:[]
                })
            }
            booksets=booksets.map((bookset,index)=>{return {serial_no:(page-1)*limit+index+1,...bookset}})
    
            const totalPages=Math.ceil(totalDocuments/limit)
            return res.status(200).json({
                success:true,
                message:'courses fetched successfully',
                totalDocuments,
                totalPages,
                booksets
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
            const category=await Bookset.find({category:keyword})
            console.log('found category',category)
            const totalDocuments=category.length
    
            const selectedCategoryCourse=await Bookset.find({category:keyword}).populate('bookList').populate('category').sort({booksetTitle:1}).skip(please_skip).limit(limit).lean()
            console.log('found selected category',selectedCategoryCourse)
            const booksets=selectedCategoryCourse.map((bookset,index)=>{return {serial_no:(page-1)*limit+index+1,...bookset}})
            console.log('modified',booksets)
    
            if(selectedCategoryCourse[0].length===0){
                res.status(200).json({
                    success:false,
                    message:'No courses found',
                    booksets:[]
                })
            }
    
            const totalPages=Math.ceil(totalDocuments/limit)
            return res.status(200).json({
                success:true,
                message:'courses fetched successfully',
                totalDocuments,
                totalPages,
                booksets
            })
    
        } catch (error) {
             return res.status(200).json({
                success:false,
                message:'Internal Server Error',
                error:error.message
            })
        }
    
}


exports.getAllCategories=async(req,res)=>{
   try {
        const allCategories=await BookCategories.find({}).populate('books')
        console.log('get-all-category',allCategories )
        return res.status(200).json({
            success:true,
            message:"All category fetch successfully",
            allCategories
        })
   } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            
        })
   }
}


exports.editBooksetDetails=async(req,res)=>{
     try {
      const booksetID= req.body.booksetID
      const updates=JSON.parse(req.body.updates)
      const bookset = await Bookset.findById(booksetID)
    
      
      if (!bookset) {
        return res.status(404).json({ error: "bookset not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnail    //     
        const image = await uploadToCloudinary(thumbnail,'examyug24/bookset_img','image',90,250,400)    //     
        bookset.thumbnail = image.secure_url    //    
      }
  
      // Update only the fields that are present in the request body
     if (Object.keys(updates).length!==0) {
       for (const key in updates) {
         if (updates.hasOwnProperty(key)) {
           bookset[key] = updates[key]
         }
       }
     }  
      await bookset.save()
  
  
      res.json({
        success: true,
        message: "Book updated successfully",
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

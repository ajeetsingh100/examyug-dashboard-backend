const Book=require('../models/Book')
const BookCategories = require('../models/BookCategories')
const {uploadToCloudinary}=require('../utilities/fileUploaderCloudinary')

/*--------FUNCTION TO HANDLE ADD BOOK----------*/
exports.addBook=async (req,res)=>{
    const {bookTitle, bookDescription,categoryID}= req.body
    const sp=Number(req.body.sellingPrice)
    const mrp=Number(req.body.maxPrice)
    console.log(req.body)
    const {demoPdf,thumbnail}=req.files
    try {         
    /*------VALIDATING INPUTS---------*/
        /*------QUERY RELATED FOR MAXPRICE AND SELLING PRICE RELATED O(ZERO)*/
        if(!bookTitle.trim()||!bookDescription.trim()||!categoryID)
        {   
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
        if(!demoPdf||!thumbnail){
            return res.status(400).json({
                success:false,
                message:"Either demoLink or book thumbnail is missing"
            })
        }

     /*------STORING THUMBNAIL AND DEMO PDF LINK IN CLOUDINARY---------*/
        const saved_demo_pdf= await uploadToCloudinary(demoPdf,'examyug24/pdf_demo_link','pdf')
        const saved_thumbnail=await uploadToCloudinary(thumbnail,'examyug24/book_img','image',90,250,400)
        console.log('data is saved to cloudinary')

     /*------ADDING BOOK IN DB---------*/
        const savedBook= await Book.create({
            bookTitle,
            bookDescription,        
            maxPrice:mrp,
            category:categoryID,
            sellingPrice:sp,
            demoPdf:saved_demo_pdf.secure_url,
            thumbnail:saved_thumbnail.secure_url
        })
        await BookCategories.findByIdAndUpdate({_id:categoryID},{$push:{books:savedBook._id}})

    /*------RETURNING SUCCESS RESPONSE TO CLIENT---------*/
        return res.status(200).json({
            success:true,
            message:'Book added successfully',
            book:savedBook
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            message:error.message
        })
    }
}   

/*--------FUNCTION TO HANDLE EDIT BOOK DETAILS----------*/


/*--------FUNCTION TO HANDLE DELETE BOOK----------*/
exports.deleteBook=async(req,res)=>{
    
}

exports.searchBook=async(req,res)=>{
    const keyword=req.query.keyword
    const page=parseInt(req.query.page)
    const limit=parseInt(req.query.limit)
    console.log(req.query)
    const please_skip=(page-1)*limit
    console.log(please_skip)
   
    try {
        const totalDocuments=await Book.countDocuments({bookTitle:{
            $regex:keyword,
            $options:'i'
        }})

        let books=await Book.find({bookTitle:{
            $regex:keyword,
            $options:'i'
        }}).populate('category').skip(please_skip).limit(limit).lean()

        
        console.log(books)
        if(books.length===0){
                console.log('a')
                return res.status(200).json({
                    sucess:false,
                    message:'searched book is not found',
                    books:[]
            })
        }
        books=books.map((book,index)=>{
            return {
                serial_no:(page-1)*limit+index+1,
                ...book
            }
        })
        console.log('hello',books)
        const totalPages=Math.ceil(totalDocuments/limit)
            return res.status(200).json({
                success:true,
                books,
                message:'all books found related to keyword',
                totalPages:totalPages,
                totalDocuments:totalDocuments
            })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            message:'Error while searching books'
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
        const category=await BookCategories.findById({_id:keyword})
        const totalDocuments=category.books.length

        const selectedCategoryBook=await BookCategories.find({_id:keyword}).populate({
            path:'books',
            populate:{path:'category'},
            options:{
                sort:{bookTitle:1},
                skip:please_skip,
                limit:limit
            }

        }).lean()
        
        const books=selectedCategoryBook[0].books.map((book,index)=>{return {serial_no:(page-1)*limit+index+1,...book}})
        console.log(books)

        if(selectedCategoryBook.length===0){
            res.status(200).json({
                success:false,
                message:'No courses found',
                books:[]
            })
        }

        const totalPages=Math.ceil(totalDocuments/limit)
        return res.status(200).json({
            success:true,
            message:'courses fetched successfully',
            totalDocuments,
            totalPages,
            books
        })

    } catch (error) {
         return res.status(200).json({
            success:false,
            message:'Internal Server Error',
            error:error.message
        })
    }
}


exports.getAllBooks=async(req,res)=>{
 try {
        const page=parseInt(req.query.page)
        const limit=parseInt(req.query.limit)
        const please_skip=(page-1)*limit

        const totalDocument=await Book.countDocuments({})
        let allBooks=await Book.find({}).populate('category').collation({ locale: 'en' }).sort({bookTitle:1}).skip(please_skip).limit(limit).lean()
        if(allBooks.length===0){
            return res.status(200).json({
                success:false,
                message:'No course is added yet',
                allBooks
            })
        }
        allBooks=allBooks.map((book,index)=>{return {serial_no:(page-1)*limit + index+1,...book}})
        const totalPages=Math.ceil(totalDocument/limit)
        return res.status(200).json({
            success:true,
            message:'all courses fetched successfully',
            allBooks,
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
  
exports.editBookDetails=async(req,res)=>{
    try {
      const bookID= req.body.bookID
      const updates=JSON.parse(req.body.updates)
      const book = await Book.findById(bookID)
      
      if (!book) {
        return res.status(404).json({ error: "book not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnail
        const demoPdf=req.files.demoPdf
        const image = await uploadToCloudinary(thumbnail,'examyug24/course_img','image',90,250,400)
        const pdf= await uploadToCloudinary(demoPdf,'examyug24/pdf_demo_link','pdf')
        book.thumbnail = image.secure_url
        book.demoPdf=pdf.secure_url
      }
  
      // Update only the fields that are present in the request body
     if (Object.keys(updates).length!==0) {
       for (const key in updates) {
         if (updates.hasOwnProperty(key)) {
           book[key] = updates[key]
         }
       }
     }  
      await book.save()
  
  
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

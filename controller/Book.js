const Book=require('../models/Book')
const {uploadToCloudinary}=require('../utilities/fileUploaderCloudinary')

/*--------FUNCTION TO HANDLE ADD BOOK----------*/
exports.addBook=async (req,res)=>{
    const {bookTitle, bookDescription, maxPrice, sellingPrice,categoryName}= req.body
    const sp=Number(sellingPrice)
    const mrp=Number(maxPrice)
    console.log(req.body)
    const {demoPdf,thumbnail}=req.files
    try {         
    /*------VALIDATING INPUTS---------*/
        /*------QUERY RELATED FOR MAXPRICE AND SELLING PRICE RELATED O(ZERO)*/
        if(!bookTitle.trim()||!bookDescription.trim()||!categoryName)
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
            maxPrice,
            categoryName,
            sellingPrice,
            demoPdf:saved_demo_pdf.secure_url,
            thumbnail:saved_thumbnail.secure_url
        })

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
exports.editBookDetails=async(req,res)=>{

}

/*--------FUNCTION TO HANDLE DELETE BOOK----------*/
exports.deleteBook=async(req,res)=>{
    
}

exports.searchBook=async(req,res)=>{
    const keyword=req.query.keyword
    const page=parseInt(req.query.page)||1
    const limit=parseInt(req.query.limit)||3
    console.log(req.query)
    const please_skip=(page-1)*limit
    console.log(please_skip)
   
    try {
        const totalDocuments=await Book.countDocuments({bookTitle:{
            $regex:keyword,
            $options:'i'
        }})

        const searchedBooks=await Book.find({bookTitle:{
            $regex:keyword,
            $options:'i'
        }}).populate('categoryName').skip(please_skip).limit(limit)


        if(searchedBooks.length===0){
                console.log('a')
                return res.status(200).json({
                    sucess:false,
                    message:'searched book is not found',
                    result:[]
            })
        }
        const totalPages=Math.ceil(totalDocuments/limit)
            return res.status(200).json({
                success:true,
                result:searchedBooks,
                message:'all books found related to keyword',
                totalPages:totalPages
            })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
            message:'Error while searching books'
        })
    }
 
    
}
const mongoose=require('mongoose')

const bookSchema=new mongoose.Schema({
    bookTitle:{
        type:String,
        required:true,
        trim:true
    },
    bookDescription:{
        type:String,
        required:true,
        trim:true
    },
    categoryName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BookCategory",
        //required:true,
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
    maxPrice:{
        type:Number,
        required:true,
        trim:true
    },
    sellingPrice:{
        type:Number,
        required:true,
        trim:true
    },
    demoPdf:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    }
},
    {
    timestamps:true
    }
)

module.exports=mongoose.model("Book",bookSchema)
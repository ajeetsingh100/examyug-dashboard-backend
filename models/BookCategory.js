const mongoose=require('mongoose')

const bookCategorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },

    books:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Book',
            required:true,
        }
    ]

})

module.exports=mongoose.model('BookCategory',bookCategorySchema)
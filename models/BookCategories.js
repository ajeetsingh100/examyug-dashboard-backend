const mongoose=require('mongoose')

const bookCategoriesSchema=new mongoose.Schema({
    categoryTitle:{
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

module.exports=mongoose.model('BookCategories',bookCategoriesSchema)
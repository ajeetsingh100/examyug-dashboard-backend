const mongoose=require('mongoose')

const booksetSchema= new mongoose.Schema({

    booksetName:{
        type:String,
        required:true
    },
    booksetDescription:{
        type:Sting,
        required:true
    },
    maxPrice:{
        type:Number,
        required:true
    },
    sellingPrice:{
        type:Number,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    bookList:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Book',
            required:true
        }
    ]

})

module.exports=mongoose.model("Bookset",booksetSchema)
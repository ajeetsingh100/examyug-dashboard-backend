const express=require('express')
const { addBook } = require('../controller/Book')
const { addCategory, getAllCategory } = require('../controller/BookCategories')
const router=express.Router()


/*--------------Book Routes--------------*/
router.post('/add-book',addBook)




/*--------------Book Category Routes--------------*/
router.post('/book-category/add-category',addCategory)
router.get('/book-category/get-all-category',getAllCategory)

module.exports=router
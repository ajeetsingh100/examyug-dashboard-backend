const express=require('express')
const { addBook,searchBook,getAllBooks,searchByCategory } = require('../controller/Book')
const { addCategory, getAllCategories,paginatedCategories} = require('../controller/BookCategories')
const router=express.Router()


/*--------------Book Routes--------------*/
router.post('/add-book',addBook)
router.get('/searched-book',searchBook)
router.get('/category-searched',searchByCategory)
router.get('/view-all-books',getAllBooks)



/*--------------Book Category Routes--------------*/
router.post('/categories/add-category',addCategory)
router.get('/categories/get-all-categories',getAllCategories)
router.get('/categories/view-all-categories',paginatedCategories)

module.exports=router
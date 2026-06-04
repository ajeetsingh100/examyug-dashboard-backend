const express=require('express')
const { addBook,searchBook,getAllBooks,searchByCategory, editBookDetails } = require('../controller/Book')
const { addCategory, getAllCategories,paginatedCategories, editCategoryDetails} = require('../controller/BookCategories')
const router=express.Router()


/*--------------Book Routes--------------*/
router.post('/add-book',addBook)
router.get('/searched-book',searchBook)
router.get('/category-searched',searchByCategory)
router.get('/view-all-books',getAllBooks)
router.post('/edit-book',editBookDetails)


/*--------------Book Category Routes--------------*/
router.post('/categories/add-category',addCategory)
router.get('/categories/get-all-categories',getAllCategories)
router.get('/categories/view-all-categories',paginatedCategories)
router.post('/edit-category',editCategoryDetails)

module.exports=router
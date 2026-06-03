const express=require('express')
const router=express.Router()
const {createBookset,getAllBooksets,searchBookset,searchByCategory,getAllCategories}=require('../controller/Bookset')

router.post('/add-bookset',createBookset)
router.get('/view-all-booksets',getAllBooksets)
router.get('/searched-bookset',searchBookset)
router.get('/category-searched',searchByCategory)

router.get('/categories/get-all-categories',getAllCategories)

module.exports=router
const express=require('express')
const router=express.Router()
const {createBookset}=require('../controller/Bookset')

router.post('/add-bookset',createBookset)
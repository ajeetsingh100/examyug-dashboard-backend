const express=require("express");
const { getAllCategory, addCategory } = require("../controller/CourseCategory");
const { addCourse } = require("../controller/Course");
const router=express.Router();

/*-----------Course Category Routes---------------*/
router.post('/add-course',addCourse)


/*-----------Course Category Routes---------------*/
router.post('/course-category/add-category',addCategory)
router.get('/course-category/get-all-category',getAllCategory)

module.exports=router
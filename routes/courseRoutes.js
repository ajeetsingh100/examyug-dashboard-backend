const express=require("express");
const { getAllCategory, addCategory,paginatedCategories, editCategoryDetails } = require("../controller/CourseCategories");
const { addCourse,getAllCourses, searchCourse,searchByCategory, editcourseDetails,getCourse } = require("../controller/Course");
const router=express.Router();

/*-----------Course Category Routes---------------*/
router.post('/add-course',addCourse)
router.post('/get-course',getCourse)
router.get('/view-all-courses',getAllCourses)
router.get('/searched-course',searchCourse)
router.get('/category-searched',searchByCategory)
router.post('/edit-course',editcourseDetails)


/*-----------Course Category Routes---------------*/
router.post('/categories/add-category',addCategory)
router.get('/categories/get-all-categories',getAllCategory)
router.get('/categories/view-all-categories',paginatedCategories)
router.post('/edit-category',editCategoryDetails)
module.exports=router
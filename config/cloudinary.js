const cloudinary=require("cloudinary").v2
require("dotenv").config()
function connectWithCloudinary(){
   try{
     cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET
    })
    console.log("app is connected with cloudinary")
   }catch(error){
    console.error(error.message);
    console.log("unable to connect with cloudinary")
   }
}

module.exports=connectWithCloudinary;

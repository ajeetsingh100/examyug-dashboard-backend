const cloudinary=require("cloudinary").v2

exports.uploadToCloudinary=async (file,folder,type,...imgProp)=>{
    const options={}
    const [quality,height,width]=[...imgProp]
    console.log('file',file)
    if(type==='pdf'){
        options.resource_type="raw"
        options.format='pdf'
        options.public_id=file.name.split('.')[0]
   
    }else {
          options.resource_type="auto"
    }
          
 
    if(quality){
        options.quality=quality
    }
    if(height){
        options.height=height
    }
    if(width){
        options.width=width
    }
    if(folder){
        options.folder=folder
    }
    const uploaded_file=await cloudinary.uploader.upload(file.tempFilePath,options)
    
    return uploaded_file
}



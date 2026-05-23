
exports.createBookset=async(req,res)=>{
    console.log(req.body)
    return res.status(200).json({
        success:true,
        message:'bookset created successfully'
    
    })
}
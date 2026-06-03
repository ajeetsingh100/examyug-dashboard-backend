const {capturePayment,verifyPayment}=require('../controller/Payment')
router.post("/capturePayment",  capturePayment)
router.post("/verifyPayment", verifyPayment)

module.exports=router
const Router = require('express').Router;
const orderModel = require('../models/order.js');
const router = Router();

// 获取生成订单的商品列表
router.get('/info',(req,res)=>{
	// todo...根据订单号获取订单信息，然后调用支付宝接口获取支付宝二维码
	res.json({
		code:0,
		data:{
			orderNo:req.query.orderNo,
			// 该地址应该从支付宝接口获取
			qrUrl:"http://127.0.0.1:8060/alipay-qr/pay.jpg"
		}
	})
})
// 获取生成订单的商品列表
router.get('/status',(req,res)=>{
	let orderNo = req.query.orderNo;
	orderModel.findOne({orderNo:orderNo},"status")
	.then(order=>{
		res.json({
			code:0,
			data:order.status == 30
		})
	})
})
module.exports = router;
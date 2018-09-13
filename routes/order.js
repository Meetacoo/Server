const Router = require('express').Router;
const userModel = require('../models/user.js')
const router = Router();

// 获取生成订单的商品列表
router.get('/orderProductList',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		user
		.getOrderProductList()
		.then(cart=>{
			res.json({
				code:0,
				data:cart
			})
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'添加订单商品失败'
		});
	})
})



module.exports = router;
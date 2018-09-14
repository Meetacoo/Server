const Router = require('express').Router;
const userModel = require('../models/user.js')
const orderModel = require('../models/order.js')
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

// 创建订单
router.post('/',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		let order = {};
		user
		.getOrderProductList()
		.then(result=>{
			order.payment = result.totalCartPrice;
			// 构建订单的商品
			let productList = [];
			result.cartList.forEach(item=>{
				console.log("item::::",item)
				productList.push({
					productId:item.productInfo._id,
					count:item.count,
					totalPrice:item.totalPrice,
					price:item.productInfo.price,
					images:item.productInfo.images,
					name:item.productInfo.name
				})
				console.log("productList:::",productList)
			})
			order.productList = productList;

			// 构建订单的地址信息
			let shipping = user.shipping.id(req.body.shippingId);
			order.shipping = {
				shippingId:shipping._id,
				name:shipping.name,
				province: shipping.province,
				city: shipping.city,
				address: shipping.address,
				phone: shipping.phone,
				zip: shipping.zip
			}

			// 构建订单号
			order.orderNo = Date.now().toString() + parseInt(Math.random() * 10000);

			// 赋值用户ID
			order.user = user._id;

			new orderModel(order)
			.save()
			.then(newOrder=>{
				res.json({
					code:0,
					data:newOrder
				})
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
const Router = require('express').Router;
const userModel = require('../models/user.js');
const router = Router();

router.get('/count',(req,res)=>{
	if (req.userInfo._id) {
		userModel
		.findById(req.userInfo._id)
		.then(user=>{
			if (user.cart) {
				let count = 0;
				user.cart.cartList.forEach(item=>{
					count += item.count
				})
				res.json({
					code:0,
					data:count
				});
			} else {
				res.json({
					code:0,
					data:0
				});
			}
			
		})
		.catch(e=>{
			res.json({
				code:1,
				massage:'获取购物车数量失败'
			});
		})
	} else {
		res.json({
			code:0,
			data:0
		});
	}
	
})


router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.json({
			code:10
		})
	}
})
// 
router.post('/',(req,res)=>{
	let body = req.body;
	// console.log(body)
	userModel.findOne({_id:req.userInfo._id})
	.then((user)=>{
		// console.log(user);
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if (cartItem) {
				cartItem.count = cartItem.count + parseInt(body.count)
			} else {
				user.cart.cartList.push({
					product:body.productId,
					count:body.count
				})
			}
		} else {
			user.cart = {
				cartList:[{
					product:body.productId,
					count:body.count
				}]
			}
		}
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				massage:'添加购物车成功'
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				massage:'添加购物车失败'
			});
		})
	})
})

router.get('/',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		user
		.getCart()
		.then(cart=>{
			res.json({
				code:0,
				data:cart
			})
			// console.log(cart)
		})
		
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'添加购物车失败'
		});
	})
})


// 
router.put('/selectOne',(req,res)=>{
	let body = req.body;
	// console.log(body)
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		// console.log(user);
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if (cartItem) {
				cartItem.checked = true
			} else {
				res.json({
					code:1,
					massage:'购物车记录不存在'
				});
			}
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})

// 
router.put('/unselectOne',(req,res)=>{
	let body = req.body;
	// console.log(body)
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		// console.log(user);
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if (cartItem) {
				cartItem.checked = false
			} else {
				res.json({
					code:1,
					massage:'购物车记录不存在'
				});
			}
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})


// 
router.put('/selectAll',(req,res)=>{
	let body = req.body;
	// console.log(body)
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		// console.log(user);
		if (user.cart) {
			user.cart.cartList.forEach(item=>{
				item.checked = true
			})
			
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				// console.log(cart)
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})

// 
router.put('/unselectAll',(req,res)=>{
	let body = req.body;
	// console.log(body)
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		// console.log(user);
		if (user.cart) {
			user.cart.cartList.forEach(item=>{
				item.checked = false
			})
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})


router.put('/delectOne',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let newCartList = user.cart.cartList.filter((item)=>{
				return item.product != body.productId;
			})
			user.cart.cartList = newCartList
			
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})

router.put('/delectSelected',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let newCartList = user.cart.cartList.filter((item)=>{
				return item.checked == false;
			})
			user.cart.cartList = newCartList;
			
		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			user
			.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})


router.put('/updateCount',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		if (user.cart) {
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId
			})
			if(cartItem){
				cartItem.count = body.count;
			}else{
				res.json({
					code:1,
					message:'购物车记录不存在'
				})			
			}

		} else {
			res.json({
				code:1,
				massage:'没有购物车'
			});
		}
		user.save()
		.then(newUser=>{
			console.log(newUser)
			user
			.getCart()
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
				massage:'更新购物车数量失败'
			});
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'更新购物车数量失败'
		});
	})
})


module.exports = router;
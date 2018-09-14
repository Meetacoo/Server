const Router = require('express').Router;
const userModel = require('../models/user.js');
const router = Router();

router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.send({
			code:10
		});
	}
})

router.post('/',(req,res)=>{
	// res.send("add ok");
	let body = req.body;
	userModel
	.findById(req.userInfo._id)
	.then((user)=>{ 
		if (user.shipping) {
			user.shipping.push(body)
		} else {
			user.shipping = [body]
		}
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping
			})
		})
		.catch((err)=>{//新增失败,渲染错误页面
	 		res.json({
				code:1,
				message:err
			})
		})
	})
	.catch((err)=>{//新增失败,渲染错误页面
 		res.json({
			code:1,
			message:'新增地址失败,数据库操作失败'
		})
	})
});

// 获取登录用户的地址列表
router.get('/list',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		res.json({
			code:0,
			data:user.shipping
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取登录用户的地址列表失败'
		});
	})
})
// 获取登录用户的地址列表
router.get('/',(req,res)=>{
	userModel
	.findById(req.userInfo._id)
	.then(user=>{
		res.json({
			code:0,
			data:user.shipping.id(req.query.shippingId)
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取登录用户的地址列表失败'
		});
	})
})


// 删除地址
router.put('/delete',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		user.shipping.id(body.shippingId).remove();
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping
			})
		})
	})
})


// 编辑地址
router.put('/',(req,res)=>{
	let body = req.body;
	userModel.findById(req.userInfo._id)
	.then((user)=>{
		let shipping = user.shipping.id(body.shippingId);
		/*let shipping = user.shipping;
		shipping.id(body.shippingId);*/
		shipping.name = body.name;
		shipping.province = body.province;
		shipping.city = body.city;
		shipping.address = body.address;
		shipping.phone = body.phone;
		shipping.zip = body.zip;
		console.log('shipping:::',shipping);
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				data:user.shipping
			})
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			massage:'获取登录用户的地址列表失败'
		});
	})
})
module.exports = router;
const Router = require('express').Router;
const userModel = require('../models/user.js')
const hmac = require('../util/hmac.js')

const router = Router(); 

// 注册用户
router.post('/register',(req,res)=>{
	let obj = req.body;
	let result = {
		code:0,
		massage:''
	}
	userModel
	.findOne({username:obj.username})
	.then((user)=>{
		if (user) { // 已经有该用户
			res.send(result = {
				code:10,
				message:'用户已存在'
			})
		} else {
			//插入数据到数据库
			new userModel({
				username:obj.username,
				password:hmac(obj.password)
				// password:hmac(obj.password)
			})
			.save((err)=>{ 
				if(!err){//插入成功
					res.json(result)
				}else{
					result.code = 10;
					result.message = '注册失败'
					res.json(result);
				}
			})
		}
	})
})

// 用户登录
router.post('/login',(req,res)=>{
	let obj = req.body;
	let result = {
		code:0,
		massage:''
	}
	userModel
	.findOne({username:obj.username,password:hmac(obj.password)})
	.then((user)=>{
		if (user) {
			req.session.userInfo = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			res.json(result);
		} else {
			result.code = 10;
			result.message = '用户名和密码错误';
			res.json(result);
		}
	})
})



module.exports = router;
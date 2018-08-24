const Router = require('express').Router;
const userModel = require('../models/user.js')
const hmac = require('../util/hmac.js')

const router = Router(); 

//权限控制
/*router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})*/

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
	/*
		if (!user) {
			userModel.insertMany(obj,(err,user)=>{
				if (!err) {
					result = {
						code:0,
						message:'注册成功'
					}
				} else {
					result = {
						code:10,
						message:'注册失败'
					}
				}
			})
		}else{
			result = {
				code:10,
				message:''
			}
		}
	*/
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
		if (user) { // 登录成功
			/*result.data = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			// 将 cookies 对象设置进去,接下来就可以 get 到
			req.cookies.set('userInfo',JSON.stringify(result.data));
			res.json(result);*/
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


// 退出
router.get('/logout',(req,res)=>{
	let result = {
		code:0,
		massage:''
	}
	// req.cookies.set('userInfo',null);
	req.session.destroy();
	res.json(result);
})

module.exports = router;
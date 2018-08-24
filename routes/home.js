const Router = require('express').Router;
const userModel = require('../models/user.js');
const commentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const fs = require('fs');
const path = require('path');
const hmac = require('../util/hmac.js');
const router = Router();

router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
// 显示首页
router.get('/',(req,res)=>{
	// console.log(req.cookies.get('userInfo'));
	// console.log(req.userInfo);
	// res.send('home');
	res.render('home/index',{
		userInfo:req.userInfo
	});
})

// 
router.get('/comments',(req,res)=>{
	commentModel.getPaginationComments(req,{user:req.userInfo._id})
	.then(data=>{
		res.render('home/comment_list',{
			userInfo:req.userInfo,
			comments:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list
		})
	})
})

router.get('/comment/delete/:id',(req,res)=>{
	let id = req.params.id;
	// console.log(id);
	
	commentModel.remove({_id:id,user:req.userInfo._id},(err,raw)=>{
		if (!err) {
			res.render('home/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/home/comments'
			})
		} else {
			res.render('home/error',{
				userInfo:req.userInfo,
				message:'删除评论失败',
				url:'/home/comments'
			})
		}
		
	});
})
// 显示修改密码页面
router.get('/password',(req,res)=>{
	res.render('home/password',{
		userInfo:req.userInfo,
	});
})
router.post('/password',(req,res)=>{
	let obj = req.body;
	// console.log(obj.repassword);
	userModel
	// .findOneAndUpdate({_id:req.userInfo._id},{$set:{password:hmac(obj.repassword)}})
	.update({_id:req.userInfo._id},{password:hmac(obj.password)})
	.then((user)=>{
		// console.log(user);
		if(user){
			req.session.destroy();
			res.render('home/success',{
				userInfo:req.userInfo,
				message:'修改密码成功',
				url:'/'
			});
		}else{
			res.render('home/error',{
				userInfo:req.userInfo,
				message:'修改密码失败，文件操作失败',
				url:'/'
			});	
		}
	})
})
module.exports = router;
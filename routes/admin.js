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


/*router.get("/init",(req,res)=>{
	//插入数据到数据库
	new userModel({
		username:'admin',
		password:hmac('admin'),
		isAdmin:true
	})
	.save((err,newUser)=>{
		if(!err){//插入成功
			res.send('ok')
		}else{
			res.send('err')				
		}
	})
});*/

router.use((req,res,next)=>{
	if (req.userInfo.isAdmin) {
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
/*// 显示首页
router.get('/',(req,res)=>{
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})*/
// 用户登录
router.post('/login',(req,res)=>{
	let obj = req.body;
	let result = {
		code:0,
		massage:''
	}
	userModel
	.findOne({username:obj.username,password:hmac(obj.password),isAdmin:true})
	.then((user)=>{
		if (user) {
			req.session.userInfo = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			result.data = {
				username:user.username
			}
			res.json(result);
		} else {
			result.code = 10;
			result.message = '用户名和密码错误';
			res.json(result);
		}
	})
})
//显示用户列表
router.get('/users',(req,res)=>{
	let options = {
		page: req.query.page,
		model: userModel,
		query :{},
		show: '_id username isAdmin',
		sort: {_id:1}
	}
	pagination(options)
	.then((data)=>{
		res.render('admin/userlist',{
			userInfo:req.userInfo,
			users:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/admin/users'
		});	 
	})
})

router.post('/uploadImages',upload.single('upload'),(req,res)=>{
	let path = "/uploads/"+req.file.filename;

	// console.log(path);
	res.json({
		uploaded:true,
		url:path
	})
})

// 
router.get('/comments',(req,res)=>{
	commentModel.getPaginationComments(req)
	.then(data=>{
		res.render('admin/comment_list',{
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
	
	commentModel.remove({_id:id},(err,raw)=>{
		if (!err) {
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/admin/comments'
			})
		} else {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除评论失败',
			})
		}
		
	});
})

// 显示站点管理页面
router.get('/site',(req,res)=>{
	let filePath = path.normalize(__dirname + '/../site-info.json');
	fs.readFile(filePath,(err,data)=>{
		if(!err){
			let site = JSON.parse(data);
			res.render('admin/site',{
					userInfo:req.userInfo,
					site:site
			});	
		}else{
			console.log(err)
		}
	})
	/*res.render('admin/site',{
		userInfo:req.userInfo
	})*/
})
//处理修改网站配置请求
router.post("/site",(req,res)=>{
	let body = req.body;
	// console.log(req.body)
	let site = {
		name:body.name,
		author:{
			name:body.authorName,
			intro:body.authorIntro,
			image:body.authorImage,
			wechat:body.authorWechat
		},
		icp:body.icp
	}
	site.carouseles = [];
	if (body.carouselUrl.length && (typeof body.carouselUrl == 'object')) {
		for (var i = 0; i < body.carouselUrl.length; i++) {
			site.carouseles.push({
				url:body.carouselUrl[i],
				path:body.carouselPath[i]
			})
		}
	} else {
		site.carouseles.push({
			url:body.carouselUrl,
			path:body.carouselPath
		})
	}
	site.ads = [];
	if (body.adUrl.length && (typeof body.adUrl == 'object')) {
		for (var i = 0; i < body.adUrl.length; i++) {
			site.ads.push({
				url:body.adUrl[i],
				path:body.adPath[i]
			})
		}
	} else {
		site.ads.push({
			url:body.adUrl,
			path:body.adPath
		})
	}
	// console.log(site);

	let siteContent = JSON.stringify(site);
	let filePath = path.normalize(__dirname + '/../site-info.json');
	fs.readFile(filePath,(err,data)=>{
		if(!err){
			fs.writeFile(filePath,siteContent,(err)=>{
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'站点管理成功',
					url:'/admin/site'
				});
			})
		}else{
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'站点管理失败，文件操作失败',
				url:'/admin/site'
			});	
		}
	})
})


// 显示修改密码页面
router.get('/password',(req,res)=>{
	res.render('admin/password',{
		userInfo:req.userInfo,
	});
})
router.post('/password',(req,res)=>{
	let obj = req.body;
	// console.log(obj.repassword);
	userModel
	.findOneAndUpdate({_id:req.userInfo._id},{$set:{password:hmac(obj.repassword)}})
	// .update({_id:req.userInfo._id},{password:hmac(obj.password)})
	.then((user)=>{
		// console.log(user);
		if(user){
			req.session.destroy();
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'修改密码成功',
				url:'/'
			});
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'修改密码失败，文件操作失败',
				url:'/'
			});	
		}
	})
})
module.exports = router;
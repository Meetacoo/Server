const Router = require('express').Router;
const path = require('path');
const fs = require('fs');
const resourceModel = require('../models/resource.js');
const pagination = require('../util/pagination.js');
const multer = require('multer');
// const upload = multer({ dest: 'public/uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/resource/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage })

const router = Router();

router.use((req,res,next)=>{
	if (req.userInfo.isAdmin) {
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
// 显示首页
router.get('/',(req,res)=>{
	let options = {
		page:req.query.page,
		model:resourceModel,
		query:{},
		projection:'-__v',
		sort:{_id:-1} //排序
	}
	pagination(options)
	.then(data=>{
		// console.log(data);
		res.render('admin/resource_list',{
			userInfo:req.userInfo,
			resources:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list
		});
	})
	
})
// 显示新增资源
router.get('/add',(req,res)=>{
	res.render('admin/resource_add',{
		userInfo:req.userInfo
	});
})
// 处理新增资源
router.post('/add',upload.single('file'),(req,res)=>{
	/*console.log(req.body);
	console.log(req.file);*/
	new resourceModel({
		name:req.body.name,
		path:'/resource/'+req.file.filename
	})
	.save()
	.then(resource=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'添加资源成功',
			url:'/resource'
		})
	})
	/*.catch(err=>{
		// console.log(err);
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'添加资源失败',
			url:'/resource'
		})
	})*/
})
router.get('/delete/:id',(req,res)=>{
	let id = req.params.id;
	
	/*resourceModel.remove({_id:id},(err,raw)=>{
		if (!err) {
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除成功',
				url:'/resource'
			})
		} else {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除失败',
				url:'/resource'
			})
		}
	});*/
	resourceModel.findByIdAndRemove(id)
	.then(resource=>{
		// console.log(resource);
		let filePath = path.normalize(__dirname+'/../public/'+resource.path);
		// console.log(filePath);
		// 删除物理文件
		fs.unlink(filePath,(err)=>{
			if (!err) {
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'添加资源成功',
					url:'/resource'
				})
			} else {
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'添加资源失败,删除文件错误',
				})
			}
		})
	})
	.catch(err=>{
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:'删除资源失败,删除数据库记录错误',
		})
	})
})

module.exports = router;
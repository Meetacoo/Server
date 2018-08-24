const Router = require('express').Router;
const categoryModel = require('../models/category.js');
const articleModel = require('../models/article.js');
const pagination = require('../util/pagination.js');

const router = Router();

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})

// 显示文章页
router.get('/',(req,res)=>{
	/*res.render('admin/article_list',{
		userInfo:req.userInfo
	});*/
	/*let options = {
		page: req.query.page,
		model: articleModel,
		query: {},
		show: '_id username isAdmin',
		sort: {_id:1},
		populate: [{path:'category',select:'name'},{path:'user',select:'username'}]
	}
	pagination(options)
	.then((data)=>{
		res.render('admin/article_list',{
			userInfo:req.userInfo,
			articles:data.users,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/article'
		});	 
	})*/
	articleModel.getPaginationArticles(req)
	.then((data)=>{
		res.render('admin/article_list',{
			userInfo:req.userInfo,
			articles:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/article'
		});	
	})
})
//显示新增文章页面
router.get('/add',(req,res)=>{
	categoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		res.render('admin/article_add',{
			userInfo:req.userInfo,
			categories:categories
		});
	})
});

router.post('/add',(req,res)=>{
	let body = req.body;
	new articleModel({
		category:body.category,
		user:req.userInfo._id,
		title:body.title,
		intro:body.intro,
		content:body.content
	})
	.save()
	.then((article)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增文章成功',
			url:'/article'
		})
	})
	.catch((err)=>{//新增失败,渲染错误页面
 		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'新增文章失败,数据库操作失败'
		})
	})
})

//显示编辑文章页面
router.get("/edit/:id",(req,res)=>{
	let id = req.params.id;
	
	categoryModel.find({})
	.populate({path:'category',select:'name'})
	.then((categories)=>{
		articleModel.findById(id)
		.then((article)=>{
			res.render('admin/article_add_edit',{
				userInfo:req.userInfo,
				cates:categories,
				article:article
			});
		})
				
	});
});

router.post('/edit',(req,res)=>{
	// let id = req.params.id; 
	let body = req.body;
	let options = {
		category:body.category,
		title:body.title,
		intro:body.intro,
		content:body.content
	}
	articleModel.updateOne({_id:body.id},options,(err,raw)=>{
		if (!err) {
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'编辑文章成功',
				url:'/article'
			})
		} else {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑文章失败',
				url:'/article'
			})
		}
	})
})

router.get('/delete/:id',(req,res)=>{
	// res.send('aaa');
	/*let body = req.body;
	console.log(body);*/
	let id = req.params.id;
	
	articleModel.remove({_id:id},(err,raw)=>{
		if (!err) {
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除成功',
				url:'/article'
			})
		} else {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除失败',
				url:'/article'
			})
		}
		
	});
})
module.exports = router;
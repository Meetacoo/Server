const Router = require('express').Router;
const categoryModel = require('../models/category.js');
// const articleModel = require('../models/article.js');

const router = Router();

router.use((req,res,next)=>{
	if (req.userInfo.isAdmin) {
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
/*router.get('/',(req,res)=>{
	res.render('admin/category',{
		userInfo:req.userInfo
	});
})*/
router.get('/list',(req,res)=>{
	let options = {
		page: req.query.page,
		model: categoryModel,
		query :{},
		show: '_id username isAdmin',
		sort: {_id:1}
	}
	pagination(options)
	.then((data)=>{
		res.render('admin/category',{
			userInfo:req.userInfo,
			categories:data.docs,
			page:data.page,
			list:data.list,
			pages:data.pages,
			url:'/category/list'
		});	 
	})
})

//显示用户列表
router.get('/add',(req,res)=>{
	// res.render('index');
	// res.send("index ok");
	res.render('admin/category_add_edit',{
		userInfo:req.userInfo
	});

});

router.post('/add',(req,res)=>{
	// res.send("add ok");
	let body = req.body;
	categoryModel.findOne({name:body.name})
	.then((cate)=>{
		if(cate){//已经存在渲染错误页面
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'新增分类失败,已有同名分类',
			})
		}else{
			new categoryModel({
				name:body.name,
				order:body.order
			})
			.save()
			.then((newCate)=>{
				if(newCate){
					// res.send('ok');
					res.render('admin/success',{
						userInfo:req.userInfo,
						message:'新增分类成功',
						url:'/category/list'
					})
				}
			})
			.catch((err)=>{//新增失败,渲染错误页面
		 		res.render('admin/error',{
					userInfo:req.userInfo,
					message:'新增分类失败,数据库操作失败'
				})
			})
		}
	})

});

//显示编辑页面
router.get("/edit/:id",(req,res)=>{
	let id = req.params.id;
	categoryModel.findById(id)
	.then((category)=>{
		// console.log("category:::::::::::::",category);
		res.render('admin/category_add_edit',{
			userInfo:req.userInfo,
			article:category,
		});		
	});
});

// 处理编辑请求
router.post('/edit',(req,res)=>{
	/*res.render('admin/category_edit',{
		userInfo:req.userInfo,
	})*/
	let body = req.body;
	// console.log(body);
/*categoryModel.findOne({name:body.name})
	.then((category)=>{
		if (category && category.order == body.order ) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑分类失败,已有同名分类'
			})
		} else {
			categoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
				if(!err){
					res.render('admin/success',{
						userInfo:req.userInfo,
						message:'修改分类成功',
						url:'/category/list'
					})					
				}else{
			 		res.render('admin/error',{
						userInfo:req.userInfo,
						message:'修改分类失败,数据库操作失败'
					})					
				}
			})
		}
	})
*/
	categoryModel.findById(body.id)
	.then((category)=>{
		if (category.name == body.name && category.order == body.order) {
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑分类失败,您并未更改数据,请修改后再编辑!'
			})
		} else {
			categoryModel.findOne({name:body.name,_id:{$ne:body.id}})
			.then((newCategory)=>{
				if (newCategory) {
					res.render('admin/error',{
						userInfo:req.userInfo,
						message:'编辑分类失败,已有同名分类'
					})
				} else {
					categoryModel.updateOne({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
						if(!err){
							res.render('admin/success',{
								userInfo:req.userInfo,
								message:'修改分类成功',
								url:'/category/list'
							})					
						}else{
					 		res.render('admin/error',{
								userInfo:req.userInfo,
								message:'修改分类失败,数据库操作失败'
							})					
						}
					})
				}
			})
		}
	})
})
router.get('/delete/:id',(req,res)=>{
	let id = req.params.id;
	categoryModel.findById({_id:id})
	.then((categories)=>{
		categoryModel.remove({_id:id},(err,categories)=>{
			if (!err) {
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除成功',
					url:'/category/list'
				})
			} else {
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'删除失败',
					url:'/category/list'
				})
			}
			
		});
	})
	// 两种方法都可以
	/*categoryModel.remove({_id:id},(err,categories)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除成功',
			url:'/category/list'
		})
	});*/
		
})

module.exports = router;
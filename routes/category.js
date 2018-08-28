const Router = require('express').Router;
const categoryModel = require('../models/category.js');
// const articleModel = require('../models/article.js');

const router = Router();

router.use((req,res,next)=>{
	if (req.userInfo.isAdmin) {
		next();
	}else{
		res.send({
			code:10
		});
	}
})
/*//显示用户列表
router.get('/',(req,res)=>{
	// res.render('index');
	// res.send("index ok");
	res.render('admin/category_add_edit',{
		userInfo:req.userInfo
	});

});*/

router.post('/',(req,res)=>{
	// res.send("add ok");
	let body = req.body;
	categoryModel
	.findOne({name:body.name,pid:body.pid})
	.then((cate)=>{
		if(cate){
			res.json({
				code:1,
				message:'新增分类失败,已有同名分类',
			})
		}else{
			new categoryModel({
				name:body.name,
				pid:body.pid
			})
			.save()
			.then((newCate)=>{
				if(newCate){
					if (body.pid == 0) {
						categoryModel.find({pid:body.pid},"_id name ")
						.then((categories)=>{
							res.json({
								code:0,
								data:categories
							})	
						})
					}else{
						res.json({
							code:0
						})	
					}
				}
			})
			/*.catch((err)=>{//新增失败,渲染错误页面
		 		res.json({
					code:1,
					message:'新增分类失败,数据库操作失败'
				})
			})*/
		}
	})
	.catch((err)=>{//新增失败,渲染错误页面
 		res.json({
			code:1,
			message:'新增分类失败,数据库操作失败'
		})
	})
});

//获取分类
/*router.get("/",(req,res)=>{
	let pid = req.query.pid;
	categoryModel.find({pid:pid},"_id name pid order")
	.then((categories)=>{
		// console.log(categories)
		res.json({
			code:0,
			data:categories
		})	
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'查找分类失败,数据库操作失败'
		})
	});
});*/

router.get('/',(req,res)=>{
	let pid = req.query.pid;
	let page = req.query.page;
	if (page) {
	/*	
		let options = {
			page: page,
			model: categoryModel,
			query :{pid:pid},
			projection: '_id name order pid',
			sort: {_id:1}
		}
		pagination(options)
	*/
		categoryModel.getPaginationCategories(req)
		.then((result)=>{
			// console.log(result)
			res.json({
				code:0,
				data:{
					current:result.current,
					total:result.total,
					list:result.list,
					pageSize:result.pageSize
				}
			});	 
		})
	} else {
		categoryModel.find({pid:pid},"_id name pid order")
		.then((categories)=>{
			res.json({
				code:0,
				data:categories
			})	
		})
		.catch(e=>{
			res.json({
				code:1,
				message:'查找分类失败,数据库操作失败'
			})
		});
	}
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
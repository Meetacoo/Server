const Router = require('express').Router;
const path = require('path');
const fs = require('fs');
const productModel = require('../models/product.js');
const pagination = require('../util/pagination.js');
const multer = require('multer');
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
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/productImage/')
	},
	filename: function (req, file, cb) {
		cb(null, Date.now()+path.extname(file.originalname))
	}
})

var upload = multer({ storage: storage })
// 处理商品图片
router.post('/uploadImage',upload.single('file'),(req,res)=>{
	const filePath = 'http://localhost:8060/productImage/' + req.file.filename;
	// console.log('save:::',filePath)
	res.send(filePath)
})


// 处理商品详情图片
router.post('/uploadDetailImage',upload.single('upload'),(req,res)=>{
	const filePath = 'http://localhost:8060/productImage/' + req.file.filename;
	// console.log(filePath)
	res.json({
		'success':true,
		'msg':'上传成功',
		'file_path':filePath
	})
})

router.post('/save',(req,res)=>{
	// res.send("add ok");
	let body = req.body;
	// console.log(body)
	productModel
	.findOne({name:body.name,pid:body.pid})
	.then((cate)=>{
		new productModel({
			name:body.name,
			category:body.category,
			name:body.name,
			description:body.description,
			price:body.price,
			images:body.images,
			stock:body.stock,
			detail:body.detail,
			status:body.status
		})
		.save()
		.then((product)=>{
			if(product){
				/*productModel
				.getPaginationProducts(1,{})
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
				})*/
				res.json({ 
					code:0,
					message: '新增商品成功'
				});	
			}
		})
	})
	.catch((err)=>{
 		res.json({
			code:1,
			message:'新增商品失败,数据库操作失败'
		})
	})
});

router.get('/',(req,res)=>{
	let page = req.query.page || 1;
	productModel
	.getPaginationProducts(page,{})
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
	.catch(e=>{
		res.json({
			code:1,
			message:'查找分类失败,数据库操作失败'
		})
	});
})


//更新order
router.put("/updateOrder",(req,res)=>{
	let body = req.body;
	productModel
	.update({_id:body.id},{order:body.order})
	.then((Product)=>{
		if (Product) {
			productModel
			.getPaginationProducts(body.page,{})
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
			res.json({
				code:1,
				message:'更新商品失败,数据库操作失败'
			})
		}
	})
});

//更新Status
router.put("/updateStatus",(req,res)=>{
	let body = req.body;
	productModel
	.update({_id:body.id},{status:body.status})
	.then((Product)=>{
		if (Product) {
			res.json({ 
				code:0,
				message:'更新状态成功'
			});
		} else {
			productModel
			.getPaginationProducts(body.page,{})
			.then((result)=>{
				// console.log(result)
				res.json({ 
					code:1,
					message:'更新状态失败',
					data:{
						current:result.current,
						total:result.total,
						list:result.list,
						pageSize:result.pageSize
					}
				});	 
			})
		}
	})
});

router.get('/detail',(req,res)=>{
	let id = req.query.id;
	productModel
	.findById(id,'-__v -order -createdAt -updateAt')
	.populate({path:'category',select:'_id pid'})
	.then((product)=>{
		// console.log(product)
		res.json({ 
			code:0,
			data:product,
			message:'查找商品信息成功'
		});	 
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'查找商品信息失败,数据库操作失败'
		})
	});
})

module.exports = router;
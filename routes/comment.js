const Router = require('express').Router;
const CommentModel = require('../models/comment.js')
const articleModel = require('../models/article.js')

const router = Router(); 

router.use((req,res,next)=>{
	if (req.userInfo._id) {
		next();
	}else{
		res.send('<h1>请用管理员账号登录</h1>');
	}
})
// 添加评论
router.post('/add',(req,res)=>{
	let body = req.body;
	// console.log(body);
	new CommentModel({
		article:body.id,
		user:req.userInfo._id,
		content:body.content
	})
	.save()
	.then(comment=>{
		CommentModel.getPaginationComments(req,{article:body.id})
		.then(data=>{
			res.json({
				code:0,
				data:data
			})
		})
	})
	.catch(err=>{
		console.log(err);
	})
})

router.get('/list',(req,res)=>{
	// console.log('aaa');
	let article = req.query.id;
	let query = {}
	if (article) {
		query.article = article
	}
	CommentModel.getPaginationComments(req,query)
	.then((data)=>{
		res.json({
			code:0,
			data:data
		})
	})
})

module.exports = router;
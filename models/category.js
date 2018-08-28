const mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
	name: {
		type:String
	},
	pid: {
		type:String
	},
	order: {
		type:Number,
		default:0
	}
});

CategorySchema.statics.getPaginationCategories = function(page,query={}){
	return new Promise((resolve,reject)=>{
		let options = {
			page: page,//需要显示的页码
			model:this, //操作的数据模型
			query:query, //查询条件
			projection:'_id name order pid', //投影，
			sort:{_id:-1}, //排序
		}
		pagination(options)
		.then((data)=>{
			resolve(data); 
		})
	})
 }

const categoryModel = mongoose.model('category',CategorySchema);
module.exports = categoryModel;
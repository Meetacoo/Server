const mongoose = require('mongoose');
const pagination = require('../util/pagination.js');

var ProductSchema = new mongoose.Schema({
	category: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'category'
	},
	name: {
		type:String
	},
	description: {
		type:String
	},
	order: {
		type:Number,
		default:0
	},
	price: {
		type:Number,
	},
	images: {
		type: String
	},
	detail: {
		type: String
	},
	status: {
		type: String,
		default: '0' ///////0在售 1下架
	},
	stock: {
		type:Number,
	}
},{
	timestamps:true
});

ProductSchema.statics.getPaginationProducts = function(page,query={},projection='name _id price status order',sort={order:-1}){
	return new Promise((resolve,reject)=>{
		let options = {
			page: page,//需要显示的页码
			model:this, //操作的数据模型
			query:query, //查询条件
			projection:projection, //投影，
			sort:sort, //排序
			populate:[{path:'category',select:'_id pid'}]
		}
		pagination(options)
		.then((data)=>{
			resolve(data); 
		})
	})
}

const productModel = mongoose.model('product',ProductSchema);
module.exports = productModel;
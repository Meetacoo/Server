const mongoose = require('mongoose');
const productModel = require('./product.js');
const ProductSchema = new mongoose.Schema({
	productId: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'Product'
	},
	price:{
		type:Number
	},
	name:{
		type:String
	},
	images:{
		type:String
	},
	count:{
		type:Number,
		default:1
	},
	totalPrice:{
		type:Number,
		default:0
	}
});
const ShippingSchema = new mongoose.Schema({
	shippingId: {
		type:String
	},
	name: {
		type:String
	},
	province: {
		type:String 
	},
	city: {
		type:String 
	},
	address: {
		type:String 
	},
	phone: {
		type:String 
	},
	zip: {
		type:String 
	}
});

const OrderSchema = new mongoose.Schema({
	// ��������
	user: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	// ������
	orderNo: {
		type:String
	},
	// ֧�����
	payment: {
		type:String 
	},
	// ֧����ʽ
	paymentType: {
		type:String,
		enum:["10","20"],//10-֧���� 20-΢��
		default:"10"
	},
	// ֧����������
	paymentTypeDesc: {
		type:String,
		enum:["֧����","΢��"],//10-֧���� 20-΢��
		default:"֧����"
	},
	paymentTime: {
		type:Date
	},
	status:{
		type:String,
		enum:["10","20","30","40","50"],//10-δ֧�� 20-ȡ�� 30-��֧�� 40-�ѷ��� 50-��� 
		default:"10"
	},
	statusDesc:{
		type:String,
		enum:["δ֧��","ȡ��","��֧��","�ѷ���","���"],
		default:"δ֧��"
	},
	// ������Ϣ
	shipping: {
		type:ShippingSchema
	},
	// ��Ʒ��Ϣ
	productList: {
		type:[ProductSchema],
		default:[]
	}
},{
	timestamps:true
});
OrderSchema.methods.getCart = function(){
	return new Promise((resolve,reject)=>{
		
	})
}

const OrderModel = mongoose.model('Order',OrderSchema);
module.exports = OrderModel;
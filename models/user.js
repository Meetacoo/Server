const mongoose = require('mongoose');
const productModel = require('./product.js')
const CartItemSchema = new mongoose.Schema({
	product: {
		type:mongoose.Schema.Types.ObjectId,
		ref:'Product'
	},
	count:{
		type:Number,
		default:1
	},
	totalPrice:{
		type:Number,
		default:0
	},
	checked:{
		type:Boolean,
		default:true
	},
	productInfo:{
		type:Object
	}
});
const CartSchema = new mongoose.Schema({
	cartList:{
		type: [CartItemSchema]
	},
	allChecked:{
		type:Boolean,
		default:true
	},
	totalCartPrice:{
		type:Number,
		default:0
	}
});
const ShippingSchema = new mongoose.Schema({
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

var UserSchema = new mongoose.Schema({
	username: {
		type:String
	},
	password: {
		type:String 
	},
	isAdmin: {
		type:Boolean,
		default:false // 默认是普通用户
	},
	email: {
		type:String
	},
	age: {
		type:String
	},
	address: {
		type:String
	},
	phone: {
		type:String 
	},
	idNo: {
		type:String
	},
	cart: {
		type:CartSchema
	},
	shipping: {
		type:[ShippingSchema],
		default:[]
	}
},{
	timestamps:true
});
UserSchema.methods.getCart = function(){
	return new Promise((resolve,reject)=>{
		if (!this.cart) {
			resolve({
				cartList:[]
			});
		}
		let getCartItems = this.cart.cartList.map(cartItem=>{
			// console.log('cartItem:::',cartItem)
			return productModel.findById(cartItem.product,'_id name price stock images')
			.then(product=>{
				// console.log('product:::',product);
				// cartItem.product = product;
				cartItem.productInfo = product;
				cartItem.totalPrice = product.price * cartItem.count;
				// console.log('cartItem.product:::',cartItem.product);				
				return cartItem
			})
		});
		Promise.all(getCartItems)
		.then(cartItems=>{
			// console.log('cartItems::::',cartItems)
			let totalCartPrice = 0;
			cartItems.forEach(item=>{
				// console.log("item:::",item)
				if (item.checked) {
					totalCartPrice += item.totalPrice
				}
			});
			this.cart.totalCartPrice = totalCartPrice;

			//设置新的购物车列表
            this.cart.cartList = cartItems;
            
            //判断是否有没有选中的项目
            let hasNotCheckedItem = cartItems.find((item)=>{
                return item.checked == false;
            });

            if(hasNotCheckedItem){
                this.cart.allChecked = false;
            }else{
                this.cart.allChecked = true;
            }
			resolve(this.cart);
			// console.log(this.cart)
		})
	})
};
UserSchema.methods.getOrderProductList = function(){
	return new Promise((resolve,reject)=>{
		if (!this.cart) {
			resolve({
				cartList:[]
			});
		}
		let checkedCartList = this.cart.cartList.filter((cartItem)=>{
			return cartItem.checked;
		});
		let getCartItems = checkedCartList.map(cartItem=>{
			// console.log('cartItem:::',cartItem)
			return productModel.findById(cartItem.product,'_id name price stock images')
			.then(product=>{
				// console.log('product:::',product);
				// cartItem.product = product;
				cartItem.productInfo = product;
				cartItem.totalPrice = product.price * cartItem.count;
				// console.log('cartItem.product:::',cartItem.product);				
				return cartItem
			})
		})
		Promise.all(getCartItems)
		.then(cartItems=>{
			// console.log('cartItems::::',cartItems)
			let totalCartPrice = 0;
			cartItems.forEach(item=>{
				// console.log("item:::",item)
				if (item.checked) {
					totalCartPrice += item.totalPrice
				}
			});
			this.cart.totalCartPrice = totalCartPrice;

			//设置新的购物车列表
            this.cart.cartList = cartItems;
			resolve(this.cart);
			// console.log(this.cart)
		})
	})
};

UserSchema.statics.getPaginationUsers = function(page,query={}){
	return new Promise((resolve,reject)=>{
		let options = {
			page: page,//需要显示的页码
			model:this, //操作的数据模型
			query:query, //查询条件
			projection:"-__v", //投影，
			sort:{_id:-1} //排序
		};
		pagination(options)
			.then((data)=>{
				console.log(197,data);
				resolve(data);
			})
	})
};

const UserModel = mongoose.model('User',UserSchema);
module.exports = UserModel;
const mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
	name: {
		type:String
	},
	order: {
		type:Number,
		default:0
	}
});

const categoryModel = mongoose.model('category',CategorySchema);
module.exports = categoryModel;
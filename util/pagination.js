/*options = {
	model: options.model,
	projection: options.projection,
	page: options.page,
	query: options.query,
	sort: options.sort,
	populate:[]
}*/
pagination = (options)=>{
	return new Promise ((resolve,reject) => {
		let page = 1;
		if (!isNaN(parseInt(options.page))) {
			page = parseInt(options.page);
		}
		if(page <= 0){
			page = 1;
		}
		//每页显示条数
		let limit = 2;
		// options.model.estimatedDocumentCount(options.query)
		options.model.countDocuments(options.query)
		.then((count)=>{
			let pages = Math.ceil(count / limit);
			if(page > pages){
				page = pages;
			}
			if (pages == 0) {
				page = 1;
			}
			let list = [];

			for(let i = 1;i<=pages;i++){
				list.push(i);
			}
			
			let skip = (page - 1)*limit;

			let hahaha = options.model.find(options.query,options.projection);
			if (options.populate) {
				for (var i = 0; i < options.populate.length; i++) {
					hahaha = hahaha.populate(options.populate[i]);
				}
			}
			hahaha
			.sort(options.sort)
			.skip(skip)
			.limit(limit)
			.then((docs)=>{
				resolve({
					docs:docs,
					page:page*1,
					list:list,
					pages:pages
				});			
			})
		})
	})
	
}	
//获取所有用户的信息,分配给模板
//需要显示的页码
	
module.exports = pagination;

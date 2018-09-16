const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Cookies = require('cookies');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);

// 启动数据库
const app = express();
mongoose.connect('mongodb://localhost:27017/shoppingSite',{ useNewUrlParser: true });
const db = mongoose.connection;

db.on('error',(err)=>{
	throw err
})
db.once('open',()=>{
	console.log('db connected ok...');
})

/*// 2:配置模板
swig.setDefaults({
	cache: false
})
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');*/

// 3:配置静态资源
app.use(express.static('public'));
app.use((req,res,next)=>{
	// console.log(req.session);
	// req.userInfo = req.session.userInfo || {};
	res.append('Access-Control-Allow-Origin',"http://localhost:3000");
	res.append("Access-Control-Allow-Credentials",true);
	res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, X-File-Name");
	next();
})
app.use(session({
	//设置cookie名称
	name:'ssite',
	//用它来对session cookie签名，防止篡改
	secret: 'keyboard cat',
	//强制保存session即使它并没有变化
	resave: false,
	//强制将未初始化的session存储
	saveUninitialized: true,
	//如果为true,则每次请求都更新cookie的过期时间
	rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection }) 
}))

app.use((req,res,next)=>{
	req.userInfo  = req.session.userInfo || {};
	next();	
});

app.use((req,res,next)=>{
	if (req.method == "OPTIONS") {
		res.end('ok')
	} else {
		next();
	}
})



// 4:添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

// 5:处理路由
app.use('/admin',require('./routes/admin.js'));
app.use('/category',require('./routes/category.js'));
app.use('/product',require('./routes/product.js'));
app.use('/cart',require('./routes/cart.js'));
app.use('/shipping',require('./routes/shipping.js'));
app.use('/order',require('./routes/order.js'));
app.use('/payment',require('./routes/payment.js'));

app.use('/',require('./routes/index.js'));
app.use('/user',require('./routes/user.js'));
app.use('/article',require('./routes/article.js'));
app.use('/comment',require('./routes/comment.js'));
app.use('/resource',require('./routes/resource.js'));
app.use('/home',require('./routes/home.js'));

app.listen(8060,()=>{
	console.log('running on 127.0.0.1:8060');
})
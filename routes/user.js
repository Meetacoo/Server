const Router = require('express').Router;
const userModel = require('../models/user.js');
const hmac = require('../util/hmac.js');

const router = Router();

/*// 初始化
router.get("/init",(req,res)=>{
	const users = [];
	console.log(users)
	for (var i = 0; i < 100; i++) {
		users.push({
			username:'test'+i,
			password:hmac('test'+i),
			isAdmin:false,
			email:'test' + i + '@huahau.com',
			phone:'15090266' + i
		})
	}
	userModel.create(users)
	.then((result)=>{
		res.end('ok')
	})
})*/

// 注册用户
router.post('/register', (req, res) => {
    let obj = req.body;
    let result = {
        code: 0,
        massage: ''
    };
    userModel
        .findOne({username: obj.username})
        .then((user) => {
            if (user) { // 已经有该用户
                res.send(result = {
                    code: 1,
                    message: '用户已存在'
                })
            } else {
                //插入数据到数据库
                new userModel({
                    username: obj.username,
                    phone: obj.phone,
                    email: obj.email,
                    password: hmac(obj.password)
                })
                    .save((err) => {
                        if (!err) {//插入成功
                            res.json(result)
                        } else {
                            result.code = 1;
                            result.message = '注册失败';
                            res.json(result);
                        }
                    })
            }
        })
})

// 用户登录
router.post('/login', (req, res) => {
    let obj = req.body;
    let result = {
        code: 0,
        massage: ''
    };
    userModel
        .findOne({username: obj.username, password: hmac(obj.password), isAdmin: false})
        .then((user) => {
            if (user) {
                req.session.userInfo = {
                    _id: user._id,
                    username: user.username,
                    isAdmin: user.isAdmin
                };
                res.json(result);
            } else {
                result.code = 1;
                result.message = '用户名和密码错误';
                res.json(result);
            }
        })
})


router.get('/username', (req, res) => {
    if (req.userInfo._id) {
        res.json({
            code: 0,
            data: {
                username: req.userInfo.username
            }
        })
    } else {
        res.json({
            code: 1
        })
    }
})


router.get('/checkUsername', (req, res) => {
    userModel
        .findOne({username: req.query.username})
        .then((user) => {
            if (user) {
                res.json({
                    code: 1,
                    message: '用户名已存在'
                })
            } else {
                code = 0
            }
        })
});


router.get('/logout', (req, res) => {
    let result = {
        code: 0,
        massage: ''
    };
    req.session.destroy();
    res.json(result);
});
// 权限控制
router.use((req, res, next) => {
    if (req.userInfo._id) {
        next();
    } else {
        res.json({
            code: 10
        });
    }
});

router.get('/userInfo', (req, res) => {
    if (req.userInfo._id) {
        userModel
            .findById(req.userInfo._id, 'username phone email')
            .then((user) => {
                res.json({
                    code: 0,
                    data: user
                })
            })
    } else {
        res.json({
            code: 1
        })
    }
});

router.put('/updatePassword', (req, res) => {
    userModel
        .update({_id: req.userInfo._id}, {password: hmac(req.body.password)})
        .then(raw => {
            res.json({
                code: 0,
                message: '修改密码成功'
            })
        })
        .catch(error => {
            res.json({
                code: 1,
                message: '修改密码失败'
            })
        })
});


// 用户保存
router.post('/save', (req, res) => {
    let obj = req.body;
    let result = {
        code: 0,
        massage: ''
    };
    userModel
        .findOne({username: obj.username})
        .then((user) => {
            if (user) { // 已经有该用户
                res.send(result = {
                    code: 1,
                    message: '用户已存在'
                })
            } else {
                //插入数据到数据库
                new userModel({
                    username: obj.username,
                    phone: obj.phone,
                    age: obj.age,
                    email: obj.email,
                    address: obj.address,
                    idNo: obj.idNo,
                    password: hmac(obj.password)
                })
                    .save((err) => {
                        if (!err) {//插入成功
                            res.json(result)
                        } else {
                            result.code = 1;
                            result.message = '注册失败';
                            res.json(result);
                        }
                    })
            }
        })
});

// 用户编辑
router.put('/save', (req, res) => {
    let obj = req.body;
    userModel
        .update({_id:obj.id},
            {
                username: obj.username,
                phone: obj.phone,
                age: obj.age,
                email: obj.email,
                address: obj.address,
                idNo: obj.idNo,
                password: hmac(obj.password)
            })
        .then((user)=>{
            res.json({
                code:0,
                message: '更新用户成功'
            })
        })
        .catch((e)=>{
            res.json({
                code:1,
                message:'更新用户失败,数据库操作失败'
            })
        })
});

router.get('/detail',(req,res)=>{
    let id = req.query.id;
    userModel
        .findById(id,'-__v -order -createdAt -updateAt')
        .populate({path:'users',select:'_id'})
        .then((user)=>{
            res.json({
                code:0,
                data:user,
                message:'查找业主信息成功'
            });

        })
        .catch(e =>{
            res.json({
                code:1,
                message:'查找业主信息失败,数据库操作失败'
            })
        });
});

router.get('/search',(req,res)=>{
    let page = req.query.page || 1;
    let keyword = req.query.keyword;
    userModel
        .getPaginationUsers(page,{username:{$regex:new RegExp(keyword,'i')}})
        .then((result)=>{
            res.json({
                code:0,
                data:{
                    current:result.current,
                    total:result.total,
                    list:result.list,
                    pageSize:result.pageSize,
                    keyword:keyword
                }
            });
        })
        .catch(e =>{
            res.json({
                code:1,
                message:'查找业主失败,数据库操作失败'
            })
        });
});
module.exports = router;
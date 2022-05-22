var express = require('express');
var router = express.Router();

const user = require('../controller/user');
const common = require('../util/common');

// router.all('*', function (req, res, next) {
//   common.log(req.headers);
//   next();
// });

//注册
router.post('/register', user.register);

//登录
router.post('/login', user.login);

//登出
router.get('/logout', common.checkLogin, user.logout);


//获取用户列表
router.get('/', common.checkLogin, common.checkIsAdmin, user.findAll);

//获取指定条件用户
router.get('/search', common.checkLogin, common.checkIsAdmin, user.search);

//获取指定ID用户
router.get('/:id', common.checkLogin, common.checkIsAdmin, user.find);

//新增用户
router.post('/', common.checkLogin, common.checkIsAdmin, user.add);

//更新用户
router.put('/:id', common.checkLogin, user.update);

//删除用户
router.delete('/:id', common.checkLogin, common.checkIsAdmin, user.remove);

module.exports = router;

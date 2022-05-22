// 导入Express框架
var express = require('express');
// Router对象
var router = express.Router();

// 导入自定义控制器
const fetch = require('../controller/fetch');
const book = require('../controller/book');
const common = require('../util/common');


// 路由守卫/前置路由/路由前置
// 在所有路由之前进行权限检测
router.all('*', common.checkLogin);

//获取全部书籍信息
router.get('/', book.findAll);

//指定关键字搜索
router.get('/search', book.search);

//搜索指定关键字
router.get('/isbn/:isbn', book.findByIsbn);

//从网页信息源获取指定ISBN书籍信息
router.get('/fetch/:isbn', fetch.fetch);

//获取指定书籍信息
router.get('/:id', book.find);

//新增书籍信息
router.post('/', book.add);

//修改书籍信息
router.put('/:id', book.update);

//删除书籍信息
router.delete('/:id', book.remove);

module.exports = router;
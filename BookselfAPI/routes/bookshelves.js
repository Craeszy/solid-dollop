var express = require('express');
var router = express.Router();

const bookshelf = require('../controller/bookshelf');
const common = require('../util/common');


router.all('*', common.checkLogin);

//获取当前书架书籍列表
router.get('/', bookshelf.findAll);

//获取书架中指定书籍信息
router.get('/:id', bookshelf.find);

//书架新增书籍信息
router.post('/', bookshelf.add);

//修改书架中书籍信息
router.put('/:id', bookshelf.update);

//删除书架中书籍
router.delete('/:id', bookshelf.remove);

//更新书架中书籍阅读状态
router.patch('/read_status/:id', bookshelf.updateReadStatus);

//更新书架中书籍评分状态
router.patch('/ranking/:id', bookshelf.updateRanking);

module.exports = router;
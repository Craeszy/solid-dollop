var express = require('express');
var router = express.Router();

const review = require('../controller/review');
const common = require('../util/common');


router.all('*', common.checkLogin);

//获取当前书籍评论列表
router.get('/', review.findAll);

//获取指定评论信息
router.get('/:id', review.find);

//新增评论
router.post('/', review.add);

//修改评论
router.put('/:id', review.update);

//删除评论
router.delete('/:id', review.remove);

router.patch('/useful/:id', review.updateUseful);

router.patch('/useless/:id', review.updateUseless);

module.exports = router;
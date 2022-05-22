const express = require('express');
const common = require('../util/common');

/**
 * @typedef {BookshelfDB}
 */
const ReviewDB = require('../sqlite/reviewdb');

module.exports = {
    find,
    findAll,
    add,
    update,
    remove,
    updateUseful,
    updateUseless
};

/**
 * 获得指定评论
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function find(req, res, next) {
    (async function () {
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.find(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定ID{${req.params.id}}评论信息`, result));
    })();
}

/**
 * 获取当前书籍评论列表
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function findAll(req, res, next) {
    (async function () {
        let book_id = req.query.book_id ? req.query.book_id : -1;
        let order_by = req.query.order_by ? req.query.order_by : 'id';
        let sort = req.query.sort ? req.query.sort : 'desc';
        let limit = req.query.limit ? req.query.limit : -1;
        let offset = req.query.offset ? req.query.offset : -1;
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.findAll(book_id, order_by, sort, limit, offset);
        await db.close();
        res.json(common.getReturnJSONData(200, '获取当前书籍评论列表', result));
    })();
}

/**
 * 新增评论
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function add(req, res, next) {
    (async function () {
        let review = {
            user_id: req.session.user.id,
            book_id: req.body.book_id,
            title: req.body.title,
            content: req.body.content,
            created_time: Date.now(),
            updated_time: Date.now()
        };
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.add(review);
        await db.close();
        res.json(common.getReturnJSONData(201, '书架中书籍信息添加成功', { id: result }));
    })();

}

/**
 * 更新评论信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function update(req, res, next) {
    (async function () {
        let review = {
            id: req.params.id,
            title: req.body.title,
            content: req.body.content,
            updated_time: Date.now()
        };
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.update(review);
        await db.close();
        res.json(common.getReturnJSONData(200, '评论信息更新成功', { changes: result }));
    })();
}

/**
 * 删除评论
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function remove(req, res, next) {
    (async function () {
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.remove(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(204, '评论删除成功', { changes: result }));
    })();
}


/**
 * 更新评论信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function updateUseful(req, res, next) {
    (async function () {
        let id =req.params.id;
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.updateUseful(id);
        await db.close();
        res.json(common.getReturnJSONData(200, '评论有用信息更新成功', { changes: result }));
    })();
}

/**
 * 更新评论信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function updateUseless(req, res, next) {
    (async function () {
        let id =req.params.id;
        let db = ReviewDB.getInstance();
        await db.connect();
        let result = await db.updateUseless(id);
        await db.close();
        res.json(common.getReturnJSONData(200, '评论无用信息更新成功', { changes: result }));
    })();
}
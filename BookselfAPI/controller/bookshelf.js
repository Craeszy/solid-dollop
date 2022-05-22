const express = require('express');
const common = require('../util/common');

/**
 * @typedef {BookshelfDB}
 */
const BookshelfDB = require('../sqlite/bookshelfdb');

module.exports = {
    find,
    findAll,
    add,
    update,
    remove,
    updateReadStatus,
    updateRanking
};

/**
 * 获得指定用户
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function find(req, res, next) {
    (async function () {
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.find(req.params.id, req.session.user.id);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定ID{${req.params.id}}书籍信息`, result));
    })();
}

/**
 * 获取当前书架书籍列表
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function findAll(req, res, next) {
    (async function () {
        let user_id = req.session.user.id;
        let order_by = req.query.order_by ? req.query.order_by : 'id';
        let sort = req.query.sort ? req.query.sort : 'desc';
        let limit = req.query.limit ? req.query.limit : -1;
        let offset = req.query.offset ? req.query.offset : -1;
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.findAll(user_id, order_by, sort, limit, offset);
        await db.close();
        res.json(common.getReturnJSONData(200, '获取当前书架书籍列表', result));
    })();
}

/**
 * 书架中新增书籍
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function add(req, res, next) {
    (async function () {
        let bookshelf = {
            user_id: req.session.user.id,
            book_id: req.body.book_id,
            created_time: Date.now(),
            updated_time: Date.now()
        };
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.add(bookshelf);
        await db.close();
        res.json(common.getReturnJSONData(201, '书架中书籍信息添加成功', { id: result }));
    })();

}

/**
 * 更新书架中指定书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function update(req, res, next) {
    (async function () {
        let bookshelf = {
            id: req.params.id,
            read_status: req.body.read_status,
            ranking: req.body.ranking,
            updated_time: Date.now()
        };
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.update(bookshelf);
        await db.close();
        res.json(common.getReturnJSONData(200, '书架中书籍信息更新成功', { changes: result }));
    })();
}

/**
 * 删除书架中指定书籍
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function remove(req, res, next) {
    (async function () {
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.remove(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(204, '书架中书籍删除成功', { changes: result }));
    })();
}

/**
 * 更新书架中书籍阅读状态
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function updateReadStatus(req, res, next) {
    (async function () {
        let id = req.params.id;
        let read_status = req.body.read_status;
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.updateReadStatus(id, read_status);
        await db.close();
        res.json(common.getReturnJSONData(200, '书架中书籍阅读状态信息更新成功', { changes: result }));
    })();
}


/**
 * 更新书架中书籍评分
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
 function updateRanking(req, res, next) {
    (async function () {
        let id = req.params.id;
        let ranking = req.body.ranking;
        let db = BookshelfDB.getInstance();
        await db.connect();
        let result = await db.updateRanking(id, ranking);
        await db.close();
        res.json(common.getReturnJSONData(200, '书架中书籍评分信息更新成功', { changes: result }));
    })();
}
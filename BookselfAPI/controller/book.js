/**
 * Book控制器模块
 */

// 导入Express框架
const express = require("express");

const common = require('../util/common');

/**
 * @typedef {BookDB}
 */
var BookDB = require('../sqlite/bookdb');   // 导入Book数据模型模块

// 导出中间件，在路由模块中使用
module.exports = {
    find,   // 查
    findAll,    //查
    add,    // 增
    update, //改
    remove, //删
    search, //查
    findByIsbn    //查
};

/**
 * 获取指定ID的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function find(req, res, next) {
    /*
    需要访问数据库，所有采用异步(Promise)代码同步(async&await)编写
    异步函数立即执行：(async function(){})();
    */
    (async function () {
        // 1.数据业务逻辑处理
        /*
            (1)外部数据
                req.params -- 路由参数 url/:<key> --> req.pareams.<key>
                req.query -- 查询串 ?k1=v1&k2=v2 --> req.query.k1 req.query.k2
                req.body -- 数据包 JSON {k1:v1, k2:v2} --> req.baody.k1 req.body.k1
                (2) 中间数据处理
                    数据格式化
                    数据加密
                    数据合法校验
                    ......
        */
        // 2.访问数据模型
        let db = BookDB.getInstance();  // 数据库
        await db.connect();
        let result = await db.find(req.params.id);
        await db.close();
        // 3.数据输出
        res.json(common.getReturnJSONData(200, `获取指定ID{${req.params.id}}书籍信息`, result));
    })();
}

/**
 * 获取指定范围的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function findAll(req, res, next) {
    (async function () {
        // 1.查询串 req.
        let limit = req.query.limit ? req.query.limit : -1;
        let offset = req.query.offset ? req.query.offset : -1;
        common.log(`limit=${limit}, offset=${offset}`);
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.findAll(limit, offset);
        await db.close();
        res.json(common.getReturnJSONData(200, '获取全部书籍信息', result));
    })();
}

/**
 * 获取指定isbn的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function findByIsbn(req, res, next) {
    (async function () {
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.findByIsbn(req.params.isbn);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定ISBN{${req.params.isbn}}书籍信息`, result));

    })();

}

/**
 * 获取指定条件的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function search(req, res, next) {
    (async function () {
        let q = req.query.q;
        let limit = req.query.limit;
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.search(q, limit);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定条件书籍信息`, result));
    })();
}

/**
 * 新增书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function add(req, res, next) {
    (async function () {
        let book = {
            title: req.body.title,
            pic: req.body.pic,
            author: req.body.author,
            publisher: req.body.publisher,
            translator: req.body.translator,
            pubdate: req.body.pubdate,
            pages: req.body.pages,
            price: req.body.price,
            binding: req.body.binding,
            series: req.body.series,
            isbn: req.body.isbn,
            created_time: Date.now(),
            updated_time: Date.now()
        };
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.add(book);
        await db.close();
        res.json(common.getReturnJSONData(201, '书籍信息添加成功', { id: result }));
    })();

}

/**
 * 更新指定ID的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function update(req, res, next) {
    (async function () {
        let book = {
            id: req.params.id,
            title: req.body.title,
            pic: req.body.pic,
            author: req.body.author,
            publisher: req.body.publisher,
            translator: req.body.translator,
            pubdate: req.body.pubdate,
            pages: req.body.pages,
            price: req.body.price,
            binding: req.body.binding,
            series: req.body.series,
            isbn: req.body.isbn,
            updated_time: Date.now()
        };
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.update(book);
        await db.close();
        res.json(common.getReturnJSONData(200, '书籍信息更新成功', { changes: result }));
    })();
}

/**
 * 删除指定ID的书籍信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function remove(req, res, next) {
    (async function () {
        let db = BookDB.getInstance();
        await db.connect();
        let result = await db.remove(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(204, '书籍信息删除成功', { changes: result }));
    })();
}
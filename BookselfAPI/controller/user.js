const express = require('express');
const common = require('../util/common');

/**
 * @typedef {UserDB}
 */
var UserDB = require('../sqlite/userdb');

module.exports = {
    find,
    findAll,
    add,
    update,
    remove,
    search,
    login,
    logout,
    register
};

/**
 * 获得指定用户
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function find(req, res, next) {
    (async function () {
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.find(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定ID{${req.params.id}}用户信息`, result));
    })();
}

/**
 * 获得用户列表
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function findAll(req, res, next) {
    (async function () {
        let limit = req.query.limit ? req.query.limit : -1;
        let offset = req.query.offset ? req.query.offset : -1;
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.findAll(limit, offset);
        await db.close();
        res.json(common.getReturnJSONData(200, '获取用户信息列表', result));
    })();
}


/**
 * 按指定条件搜索用户
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function search(req, res, next) {
    (async function () {
        let q = req.query.q;
        let limit = req.query.limit;
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.search(q, limit);
        await db.close();
        res.json(common.getReturnJSONData(200, `获取指定条件用户信息`, result));
    })();
}


/**
 * 新增用户
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function add(req, res, next) {
    (async function () {
        let user = {
            username: req.body.username,
            password: common.md5pwd(req.body.password),
            nickname: req.body.nickname,
            truename: req.body.truename,
            avatar: req.body.avatar,
            role: req.body.role,
            last_login_time: 0,
            last_login_ip: 'never login',
            created_time: Date.now(),
            created_ip: common.getReqRemoteIp(req),
            updated_time: Date.now()
        };
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.add(user);
        await db.close();
        res.json(common.getReturnJSONData(201, '用户添加成功', { id: result }));
    })();
}

/**
 * 更新用户信息
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function update(req, res, next) {
    (async function () {
        let access = false;
        
        if (req.session.user.role === 1) {
            access = true;
        }else if (String(req.session.user.id) === req.params.id) {
            access = true;
        }
        
        if (!access) {
            res.json(common.getReturnJSONData(403, '无访问权限'));
        } else {
            let user = {
                id: req.params.id,
                username: req.body.username,
                password: common.md5pwd(req.body.password),
                nickname: req.body.nickname,
                truename: req.body.truename,
                avatar: req.body.avatar,
                role: req.body.role,
                updated_time: Date.now()
            };
            let db = UserDB.getInstance();
            await db.connect();
            let result = await db.update(user);
            await db.close();
            res.json(common.getReturnJSONData(200, '用户信息更新成功', { changes: result }));
        }
    })();
}

/**
 * 删除用户
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function remove(req, res, next) {
    (async function () {
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.remove(req.params.id);
        await db.close();
        res.json(common.getReturnJSONData(204, '用户信息删除成功', { changes: result }));
    })();
}

/**
 * 登录
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function login(req, res, next) {
    (async function () {
        let username = req.body.username;
        let password = common.md5pwd(req.body.password);
        let msg = `用户[${username}]登录失败，请检查用户名和密码！`;
        let data = { login_status: 'failed' };
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.login(username, password);
        // common.log(result.username);
        if (result) {
            msg = `用户[${username}]登录成功`;
            data = { login_status: 'success' };
            let last_login = {
                time: Date.now(),
                ip: common.getReqRemoteIp(req)
            };
            await db.touch(username, last_login);
            req.session.isLogin = true;
            req.session.user = result;
        }
        await db.close();

        res.json(common.getReturnJSONData(200, msg, data));
    })();
}

/**
 * 登出
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function logout(req, res, next) {
    let username = req.session.user.username;
    req.session.destroy(function (err) {
        common.log(err);
    })
    res.json(common.getReturnJSONData(200, `用户[${username}]退出系统`, { logout_status: 'success' }));
}

/**
 * 注册
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function register(req, res, next) {
    (async function () {
        let user = {
            username: req.body.username,
            password: common.md5pwd(req.body.password),
            nickname: req.body.nickname,
            truename: req.body.truename,
            avatar: req.body.avatar,
            role: 2,
            last_login_time: 0,
            last_login_ip: 'never login',
            created_time: Date.now(),
            created_ip: common.getReqRemoteIp(req),
            updated_time: Date.now()
        };
        let db = UserDB.getInstance();
        await db.connect();
        let result = await db.register(user);
        await db.close();
        res.json(common.getReturnJSONData(200, '用户注册成功', { id: result }));
    })();
}






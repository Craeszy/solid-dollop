//@ts-check
const sqlite3 = require('sqlite3').verbose();

const config = require('../config');
const common = require('../util/common');

//ECMAScript 2015 Classes Syntax

class UserDB {
    /**
     * @constructor
     * @private
     */
    constructor() {
        this.dbFile = config.dbFile;
        this.instance = null;
        this.register = this.add;
    }

    /**
     * 打印错误信息
     * @private
     * @param {Error} err 
     */
    printErrorMessage(err) {
        console.log('Error Message: ' + err);
    }

    /**
     * 打印提示信息
     * @private
     * @param {String} msg 
     */
    printMessage(msg) {
        console.log('DB Message: ' + msg);
    }

    /**
     * 获取访问数据库单实例
     * @public
     * @returns {UserDB} UserDB
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new UserDB();
        }
        return this.instance;
    }

    /**
     * 连接数据库
     * @public
     * @returns {Promise} Promise
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbFile, (err) => {
                if (err) {
                    this.printErrorMessage(err);
                    reject(err);
                } else {
                    resolve(err);
                }
            });
        });
    }

    /**
     * 关闭数据库
     * @public
     * @returns {Promise} Promise
     */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    this.printErrorMessage(err);
                    reject(err);
                } else {
                    resolve(err);
                }
            });
        });
    }

    /**
     * 获取用户信息
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    find(id) {
        return new Promise((resolve, reject) => {
            // 1.sql询问
            let sql = 'SELECT * FROM users WHERE id = ?';
            // 2.sql语句参数
            let params = [id];
            // 3.执行
            this.db.get(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * 获取用户列表
     * @public
     * @param {Number} limit 
     * @param {Number} offset 
     * @returns {Promise} Promise
     */
    findAll(limit = -1, offset = -1) {
        return new Promise((resolve, reject) => {
            let sql = '';
            let params = [];
            if (limit === -1) {
                sql = 'SELECT * FROM users ORDER BY id';
            } else if (offset === -1) {
                sql = 'SELECT * FROM users ORDER BY id LIMIT ? ';
                params[0] = limit;
            } else {
                sql = 'SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?';
                params[0] = limit;
                params[1] = offset;
            }

            this.db.all(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * 获取符合指定条件的用户
     * @public
     * @param {String} q 
     * @param {Number} limit 
     * @returns {Promise} Promise
     */
    search(q, limit = -1) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM users WHERE username LIKE ? OR nickname LIKE ?  OR truename LIKE ?';
            if (limit !== -1) {
                sql += 'LIMIT ' + limit;
            }
            q = '%' + q + '%';
            let params = [q, q, q];
            this.db.all(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * 新增用户
     * @public
     * @param {Object} user 
     * @returns {Promise} Promise
     */
    add(user) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO users \
            (username, password, nickname, truename, avatar, role, last_login_time, last_login_ip, created_time, created_ip, updated_time) \
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

            let params = [
                user.username, user.password, user.nickname,
                user.truename, user.avatar, user.role,
                user.last_login_time, user.last_login_ip,
                user.created_time, user.created_ip,
                user.updated_time
            ];

            this.db.run(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });

    }

    /**
     * 更新用户
     * @public
     * @param {Object} user 
     * @returns {Promise} Promise
     */
    update(user) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE users SET \
            username = ?, password = ?, nickname = ?, \
            truename = ?, avatar = ?, role = ?, \
            updated_time =? \
            WHERE id = ?';

            let params = [
                user.username, user.password, user.nickname,
                user.truename, user.avatar, user.role,
                user.updated_time, user.id
            ];

            this.db.run(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    /**
     * 删除一个用户
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    remove (id) {
        return new Promise((resolve, reject) => {
            let sql = 'DELETE FROM users WHERE id = ?';
    
            let params = [id];
    
            this.db.run(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    /**
     * 用户登录
     * @public
     * @param {String} username 
     * @param {String} password 
     * @returns {Promise} Promise
     */
    login(username, password){
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

            let params = [username, password];

            this.db.get(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * 更新用户状态
     * @param {String} username 
     * @param {Object} last_login 
     * @returns 
     */
    touch(username, last_login){
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE users SET \
            last_login_time = ?, last_login_ip = ?, \
            login_count = login_count + 1 \
            WHERE username = ?';

            let params = [
                last_login.time, last_login.ip, username
            ];

            this.db.run(sql, params, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }
}


module.exports = UserDB;
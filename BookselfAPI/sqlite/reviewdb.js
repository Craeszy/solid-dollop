const sqlite3 = require('sqlite3').verbose();

const config = require('../config');
const common = require('../util/common');


class ReviewDB {
    /**
     * @constructor
     * @private
     */
    constructor() {
        this.dbFile = config.dbFile;
        this.instance = null;
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
     * @returns {ReviewDB} ReviewDB
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new ReviewDB();
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
     * 获取书籍的一条评论信息
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    find(id) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    a.id as id,
                    a.book_id as book_id,
                    a.user_id as user_id,
                    a.title AS title,
                    a.content AS content,
                    a.useful AS useful,
                    a.useless AS useless,
                    a.created_time AS created_time,
                    a.updated_time AS updated_time,
                    b.title AS book_title,
                    b.pic AS pic,
                    b.author AS author,
                    b.publisher as publisher,
                    b.translator as translator,
                    b.pubdate as pubdate,
                    b.pages as pages,
                    b.price as price,
                    b.binding as binding,
                    b.series as series,
                    b.isbn as isbn,
                    c.username AS username,
                    c.nickname AS nickname
                FROM reviews AS a 
                LEFT JOIN books AS b ON a.book_id = b.id 
                LEFT JOIN users AS c ON a.user_id = c.id
                WHERE a.id = ?
            `;
            let params = [id];

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
     * 获取当前书籍所有评论
     * @public
     * @param {Number} book_id
     * @param {String} order_by
     * @param {String} sort
     * @param {Number} limit 
     * @param {Number} offset 
     * @returns {Promise} Promise
     */
    findAll(book_id, order_by = 'id', sort = 'desc', limit = -1, offset = -1) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    a.id as id,
                    a.book_id as book_id,
                    a.user_id as user_id,
                    a.title AS title,
                    a.content AS content,
                    a.useful AS useful,
                    a.useless AS useless,
                    a.created_time AS created_time,
                    a.updated_time AS updated_time,
                    b.title AS book_title,
                    b.pic AS pic,
                    b.author AS author,
                    b.publisher as publisher,
                    b.translator as translator,
                    b.pubdate as pubdate,
                    b.pages as pages,
                    b.price as price,
                    b.binding as binding,
                    b.series as series,
                    b.isbn as isbn,
                    c.username AS username,
                    c.nickname AS nickname
                FROM reviews AS a 
                LEFT JOIN books AS b ON a.book_id = b.id 
                LEFT JOIN users AS c ON a.user_id = c.id
                WHERE book_id = ?          
            `;
            let params = [book_id];
            if (limit === -1) {
                sql += ` ORDER BY ${order_by} ${sort}`;
            } else if (offset === -1) {
                sql += ` ORDER BY ${order_by} ${sort} LIMIT ?`;
                params[1] = limit;
            } else {
                sql += ` ORDER BY ${order_by} ${sort} LIMIT ? OFFSET ?`;
                params[1] = limit;
                params[2] = offset;
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
     * 新增一条评论
     * @public
     * @param {Object} review 
     * @returns {Promise} Promise
     */
    add(review) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO reviews \
            (user_id, book_id, title, content, created_time, updated_time) \
            VALUES (?, ?, ?, ?, ?, ?);';

            let params = [
                review.user_id, review.book_id,
                review.title, review.content,
                review.created_time, review.updated_time
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
     * 更新评论
     * @public
     * @param {Object} review 
     * @returns {Promise} Promise
     */
    update(review) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE reviews SET \
            title = ?, content = ?, updated_time =? \
            WHERE id = ?';

            let params = [
                review.title, review.content,
                review.updated_time, review.id
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
     * 删除评论
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    remove(id) {
        return new Promise((resolve, reject) => {
            let sql = 'DELETE FROM reviews WHERE id = ?';

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
     * 更新评论有用数据
     * @public
     * @param {Object} review 
     * @returns {Promise} Promise
     */
    updateUseful(id) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE reviews SET  useful = useful + 1 WHERE id = ?';

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
     * 更新评论无用数据
     * @public
     * @param {Object} review 
     * @returns {Promise} Promise
     */
     updateUseless(id) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE reviews SET  useless = useless + 1 WHERE id = ?';

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

}




module.exports = ReviewDB;
const sqlite3 = require('sqlite3').verbose();

const config = require('../config');
const common = require('../util/common');

class BookshelfDB {
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
     * @returns {BookshelfDB} BookshelfDB
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new BookshelfDB();
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
     * 获取书架中书籍信息
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    find(id, user_id) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    a.id as id,
                    a.book_id as book_id,
                    a.user_id as user_id,
                    a.read_status AS read_status,
                    a.ranking AS ranking,
                    a.created_time AS created_time,
                    a.updated_time AS updated_time,
                    b.title AS title,
                    b.pic AS pic,
                    b.author AS author,
                    b.publisher as publisher,
                    b.translator as translator,
                    b.pubdate as pubdate,
                    b.pages as pages,
                    b.price as price,
                    b.binding as binding,
                    b.series as series,
                    b.isbn as isbn
                FROM bookshelves AS a 
                LEFT JOIN books AS b ON a.book_id = b.id 
                WHERE a.id = ? AND a.user_id = ?
            `;

            let params = [id, user_id];
            common.log(params);

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
     * 获取书架中所有书籍信息
     * @public
     * @param {Number} user_id
     * @param {String} order_by
     * @param {String} sort
     * @param {Number} limit 
     * @param {Number} offset 
     * @returns {Promise} Promise
     */
    findAll(user_id, order_by = 'id', sort = 'desc', limit = -1, offset = -1) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    a.id as id,
                    a.book_id as book_id,
                    a.user_id as user_id,
                    a.read_status AS read_status,
                    a.ranking AS ranking,
                    a.created_time AS created_time,
                    a.updated_time AS updated_time,
                    b.title AS title,
                    b.pic AS pic,
                    b.author AS author,
                    b.publisher as publisher,
                    b.translator as translator,
                    b.pubdate as pubdate,
                    b.pages as pages,
                    b.price as price,
                    b.binding as binding,
                    b.series as series,
                    b.isbn as isbn
                FROM bookshelves AS a 
                LEFT JOIN books AS b ON a.book_id = b.id 
                WHERE a.user_id = ?            
            `;
            let params = [user_id];
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
     * 在书架中新增书籍
     * @public
     * @param {Object} bookshelf 
     * @returns {Promise} Promise
     */
    add(bookshelf) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO bookshelves \
            (user_id, book_id, created_time, updated_time) \
            VALUES (?, ?, ?, ?);';

            let params = [
                bookshelf.user_id, bookshelf.book_id,
                bookshelf.created_time, bookshelf.updated_time
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
     * 更新书架中指定书籍
     * @public
     * @param {Object} bookshelf 
     * @returns {Promise} Promise
     */
    update(bookshelf) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE bookshelves SET \
            read_status = ?, ranking = ?, updated_time =? \
            WHERE id = ?';

            let params = [
                bookshelf.read_status, bookshelf.ranking,
                bookshelf.updated_time, bookshelf.id
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
     * 删除书架中指定书籍
     * @public
     * @param {Number} id 
     * @returns {Promise} Promise
     */
    remove(id) {
        return new Promise((resolve, reject) => {
            let sql = 'DELETE FROM bookshelves WHERE id = ?';

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
     * 更新书籍阅读状态
     * 0 - 未读
     * 1 - 想读
     * 2 - 正在读
     * 3 - 读完
     * @param {Number} id 
     * @param {Number} read_status 
     * @returns {Promise} Promise
     */
    updateReadStatus(id, read_status){
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE bookshelves SET read_status = ? WHERE id = ?';

            let params = [
                read_status, id
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
     * 更新书籍评分
     * 1-5星(数字从1-10)
     * @param {Number} id 
     * @param {Number} ranking 
     * @returns {Promise} Promise
     */
    updateRanking(id, ranking){
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE bookshelves SET ranking = ? WHERE id = ?';
            let params = [
               ranking, id
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

module.exports = BookshelfDB;
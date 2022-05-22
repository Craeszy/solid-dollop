//@ts-check
const sqlite3 = require('sqlite3').verbose();

const config = require('../config');


/**
 * 书籍访问类构造方法
 * @constructor
 * @private
 */
function BookDB() {
    this.dbFile = config.dbFile;
    this.instance = null;
}

/**
 * 数据库构造
 * @returns 实例
 */
BookDB.getInstance = function () {
    if (!this.instance) {
        this.instance = new BookDB();
    }
    return this.instance;
};

/**
 * 输出错误信息
 * @param {Error} err 
 * @public
 */
BookDB.prototype.printErrorMessage = function (err) {
    console.log('Error Message: ' + err);
};

/**
 * 输出提示信息
 * @param {String} msg 
 * @public
 */
BookDB.prototype.printMessage = function (msg) {
    console.log('DB Message: ' + msg);
};

/**
 * 连接数据库
 * @returns {Promise} Promise对象
 */
BookDB.prototype.connect = function () {
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
 * @returns {Promise}  Promise对象
 */
BookDB.prototype.close = function () {
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
 * 获取指定内部ID的书籍信息
 * @param {Number} bookId 
 * @returns {Promise}
 */
BookDB.prototype.find = function (bookId) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM books WHERE id = ?';

        let params = [bookId];

        this.db.get(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * 获取所有书籍信息
 * @param {Number} limit 
 * @param {Number} offset 
 * @returns {Promise}
 */
BookDB.prototype.findAll = function (limit = -1, offset = -1) {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params = [];
        if (limit === -1) {
            sql = 'SELECT * FROM books ORDER BY id';
        } else if (offset === -1) {
            sql = 'SELECT * FROM books ORDER BY id LIMIT ? ';
            params[0] = limit;
        } else {
            sql = 'SELECT * FROM books ORDER BY id LIMIT ? OFFSET ?';
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
};

/**
 * 获取指定ISBN号的书籍信息
 * @param {String} bookIsbn 
 * @returns {Promise}
 */
BookDB.prototype.findByIsbn = function (bookIsbn) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM books WHERE isbn = ?';

        let params = [bookIsbn];

        this.db.get(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * 在书名与作者中搜索符合指定条件的记录集
 * @param {String} q 
 * @param {Number} limit 
 * @returns {Promise}
 */
BookDB.prototype.search = function (q, limit = -1) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ';
        if (limit !== -1) {
            sql += 'LIMIT ' + limit;
        }
        q = '%' + q + '%';
        let params = [q, q];
        this.db.all(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * 新增书籍信息
 * @param {Object} book 
 * @returns {Promise} 
 */
BookDB.prototype.add = function (book) {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO books \
        (title, pic, author, publisher, translator, pubdate, pages, price, binding, series, isbn, created_time, updated_time) \
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

        let params = [
            book.title, book.pic, book.author,
            book.publisher, book.translator, book.pubdate,
            book.pages, book.price, book.binding,
            book.series, book.isbn, book.created_time,
            book.updated_time
        ];

        this.db.run(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });

};


/**
 * 更新书籍信息
 * @param {Object} book 
 * @returns {Promise} 
 */
BookDB.prototype.update = function (book) {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE books SET \
        title = ?, pic = ?, author = ?, \
        publisher = ?, translator = ?, pubdate = ?, \
        pages = ?, price = ?, binding =?, \
        series = ?, isbn = ?, updated_time =? \
        WHERE id = ?';

        let params = [
            book.title, book.pic, book.author,
            book.publisher, book.translator, book.pubdate,
            book.pages, book.price, book.binding,
            book.series, book.isbn, book.updated_time,
            book.id
        ];

        this.db.run(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

/**
 * 
 * @param {Number} bookId 
 * @returns {Promise} 
 */
BookDB.prototype.remove = function (bookId) {
    return new Promise((resolve, reject) => {
        let sql = 'DELETE FROM books WHERE id = ?';

        let params = [bookId];

        this.db.run(sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};


module.exports = BookDB;


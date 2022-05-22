const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const config = require('../config');
const common = require('../util/common');

const bookCreateSql = `
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(255) NOT NULL,
        pic TEXT,
        author VARCHAR(255),
        publisher VARCHAR(255),
        translator VARCHAR(255),
        pubdate VARCHAR(255),
        pages VARCHAR(255),
        price VARCHAR(255),
        binding VARCHAR(255),
        series VARCHAR(255),
        isbn VARCHAR(255) NOT NULL,
        created_time DATETIME NOT NULL,
        updated_time DATETIME NOT NULL
    );
`;

const userCreateSql = `
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(255),
        truename VARCHAR(255),
        avatar VARCHAR(255),
        role INTEGER NOT NULL,
        last_login_time DATETIME NOT NULL,
        last_login_ip VARCHAR(255) NOT NULL,
        login_count INTEGER DEFAULT 0,
        created_time DATETIME NOT NULL,
        created_ip VARCHAR(255) NOT NULL,
        updated_time DATETIME NOT NULL
    );
`;

const adminUserSql = `
    INSERT INTO users (
        username, password, nickname, truename, avatar, role, 
        last_login_time, last_login_ip, login_count,
        created_time, created_ip, updated_time
    ) VALUES (
        'admin', '${common.md5pwd('123456')}', '系统管理员', '管理员1', 
        './images/default.png', 1, 0, 'never login', 0, ${Date.now()}, 'system init', 
        ${Date.now()}
    );
`;

const bookshelvesCreateSql = `
    CREATE TABLE IF NOT EXISTS bookshelves(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        read_status INTEGER DEFAULT 0,
        ranking INTEGER DEFAULT 0,
        created_time DATETIME NOT NULL,
        updated_time DATETIME NOT NULL
    );        
`;

const reviewsCreateSql = `
CREATE TABLE IF NOT EXISTS reviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    book_id INTEGER NOT NULL,    
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    useful INTEGER DEFAULT 0, 
    useless INTEGER DEFAULT 0, 
    created_time DATETIME NOT NULL,
    updated_time DATETIME NOT NULL
); 
`;

/**
 * SqliteDB构造方法
 * @constructor
 */
function SqliteDB() {
    this.dbFile = config.dbFile;
    common.log('创建Sqlite数据库文件');
    if (!fs.existsSync(this.dbFile)) {
        this.initDB();
    }
};

/**
 * 输出错误信息
 * @param {Error} err 
 * @public
 */
SqliteDB.prototype.printErrorMessage = function (err) {
    console.log('Error Message: ' + err);
};

/**
 * 输出提示信息
 * @param {String} msg 
 * @public
 */
SqliteDB.prototype.printMessage = function (msg) {
    console.log('DB Message: ' + msg);
};

/**
 * 数据库初始化
 * @private
 */
SqliteDB.prototype.initDB = function () {
    let db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            this.printErrorMessage(err);
        }
    });
    db.serialize(() => {
        db.run(bookCreateSql);
        this.printMessage('Book数据表创建成功，SQL：\n ' + bookCreateSql);
        db.run(userCreateSql);
        this.printMessage('User数据表创建成功，SQL：\n ' + userCreateSql);
        db.run(adminUserSql);
        this.printMessage('管理员初始化，SQL：\n ' + adminUserSql);
        db.run(bookshelvesCreateSql);
        this.printMessage('Bookshelve数据表创建成功，SQL：\n ' + bookshelvesCreateSql);
        db.run(reviewsCreateSql);
        this.printMessage('Review数据表创建成功，SQL：\n ' + reviewsCreateSql);
    });
    db.close((err) => {
        if (err) {
            this.printErrorMessage(err);
        }
    });
}


module.exports = SqliteDB;
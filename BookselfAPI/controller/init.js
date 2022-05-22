const express = require("express");
const SqliteDB = require('../sqlite/initdb');
const common = require('../util/common');

module.exports = dbInit;

/**
 * 创建数据库中间件
 * @param {Object} options 
 * @returns {Function}
 */
function dbInit(options) {  
    new SqliteDB();
    return function dbInit(req, res, next){
        common.log('创建系统数据库伪回调方法');
        // new SqliteDB();
        next();
    }
}

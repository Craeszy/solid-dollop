/**
 * 爬虫：书籍信息
 * 当前来源为“豆瓣”
 * 
 */

const express = require("express");
// axios XHR方式的网路访问模块 原生<fetch>模块 异步Promise对象
const axios = require('axios').default;
// 类JQuery 的DOM访问模块 JQuery核心功能的服务端实现
/* cheerio：1.选择器(CSS)
            2.页面访问
                html()  html标签及标签包含的内容
                text()  html标签包含的文本内容
                ottr()  html标签的属性
*/
const cheerio = require('cheerio');

// 导入自定义模块
const config = require('../config');
const common = require('../util/common');

// 导出指定函数
module.exports = {
    fetch
};

// 全局的book信息数据结构定义
let bookInfo = {
    title: '',
    pic: '',
    author: '',
    publisher: '',
    translator: '',
    pubdate: '',
    pages: '',
    price: '',
    binding: '',
    series: '',
    isbn: '',
};

/**
 *  通过指定ISBN号获取豆瓣书籍信息页面
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function fetch(req, res, next) {
    clearBookInfo();    // book对象重置
    const url = config.douban.bookUrl + req.params.isbn;    // 通过路由参数获取访问链接
    // 通过axios的get方法获取指定页面
    /* axios 返回的数据是标准的JSON数据格式 
    {
        code:
        statusText:
        headers:
        data:
    }
    */
    axios.get(url).then(function (response) {
        let bookInfo = fetchDouban(response.data);
        res.json(common.getReturnJSONData(200, '豆瓣书籍信息', bookInfo));
    }).catch(function (error) {
        console.error(error);
        res.json(common.getReturnJSONData(400, '无法获取信息'));
    });
}

/**
 * 通过分析对应豆瓣页面获得指定书籍信息
 * @param {String} html 
 * @returns {bookInfo}
 */
function fetchDouban(html) {
    clearBookInfo();
    const $ = cheerio.load(html);   // book对象重置
    bookInfo.title = $(config.douban.bookTitle).text(); // 创建cheerio对象，jQuery --> $

    //lodash
    //rx.js
    bookInfo.pic = $(config.douban.bookPic).attr('src');    // 获取书籍信息标题
    let info = $(config.douban.bookInfo).text().trim().split('\n'); // 获取书籍图片链接
    // console.log(info);

    formatInfo(bookInfo, info);

    // console.log(bookInfo);

    return bookInfo;
};


/**
 * 豆瓣网页信息中作者与译者信息与其他信息的标签不同，从问问方式处理
 * @param {bookInfo} bookInfo 
 * @param {String[]} info 
 */
function formatInfo(bookInfo, info) {

    // 信息数组，去除空数据行
    let infoArr = [];


    info.forEach(element => {
        element = element.trim();   // 删除首位空白
        if (!element.match(/^[ ]*$/)) { // 通过正则表达式匹配空行
            infoArr.push(element);
        }
    });



    // 生成字符串
    let infoStr = infoArr.join('');

    console.log(infoStr);

    // 数据清洗，建立标准数据分割
    // FIXME:如果数据中存在"|",需修改分割标准
    let temp = infoStr.replace('作者:', '作者:')
        .replace('出版社:', '|出版社:')
        .replace('原作名:', '|原作名:')
        .replace('译者:', '|译者:')
        .replace('出版年:', '|出版年:')
        .replace('页数:', '|页数:')
        .replace('定价:', '|定价:')
        .replace('装帧:', '|装帧:')
        .replace('丛书:', '|丛书:')
        .replace('ISBN:', '|ISBN:');
    console.log(temp);

    // let temp = '';
    // let start = 0;
    // for (let i = start; i < infoArr.length; i++) {
    //     if (infoArr[i].match('作者')) {
    //         temp += infoArr[i];
    //     } else if (infoArr[i].match('出版社')) {
    //         infoC.push(temp);
    //         start = i;
    //         temp = '';
    //         break;
    //     }else{
    //         temp += infoArr[i];
    //     }
    // }
    // for (let i = start; i < infoArr.length; i++) {
    //     if (!infoArr[i].match('译者')) {
    //         infoC.push(infoArr[i]);
    //     } else {
    //         start = i;
    //         break;
    //     }
    // }
    // for (let i = start; i < infoArr.length; i++) {
    //     if (infoArr[i].match('译者')) {
    //         temp += infoArr[i];
    //     } else if (infoArr[i].match('出版年')) {
    //         infoC.push(temp);
    //         start = i;
    //         temp = '';
    //         break;
    //     }else{
    //         temp += infoArr[i];
    //     }
    // }
    // for (let i = start; i < infoArr.length; i++) {
    //     infoC.push(infoArr[i]);
    // }

    // console.log(infoC);
    // 数据格式化
    // FIXME: 英文冒号变成中文冒号
    let infoC = temp.split('|');    

    for (let i = 0; i < infoC.length; i++) {
        const element = infoC[i];
        if (element.match('作者')) {
            bookInfo.author = element.split(':')[1].trim();
        }
        if (element.match('出版社')) {
            bookInfo.publisher = element.split(':')[1].trim();
        }
        if (element.match('译者')) {
            bookInfo.translator = element.split(':')[1].trim();
        }
        if (element.match('出版年')) {
            bookInfo.pubdate = element.split(':')[1].trim();
        }
        if (element.match('页数')) {
            bookInfo.pages = element.split(':')[1].trim();
        }
        if (element.match('定价')) {
            bookInfo.price = element.split(':')[1].trim();
        }
        if (element.match('装帧')) {
            bookInfo.binding = element.split(':')[1].trim();
        }
        if (element.match('丛书')) {
            bookInfo.series = element.split(':')[1].trim();
        }
        if (element.match('ISBN')) {
            bookInfo.isbn = element.split(':')[1].trim();
        }
    }
}

/**
 * 清除bookInfo原有内容
 */
function clearBookInfo() {
    for (const key in bookInfo) {
        if (Object.hasOwnProperty.call(bookInfo, key)) {
            bookInfo[key] = '';
        }
    }
}
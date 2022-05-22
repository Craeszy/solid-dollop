var path = require('path');


let config = {
    dbFile: path.join(__dirname, 'sqlite/mylibrary.db'),
    douban:{
        bookUrl : 'https://book.douban.com/isbn/',
        bookTitle : '#wrapper h1 span',
        bookPic : '#mainpic img',
        bookInfo : '#info'
    } 
};

module.exports = config;
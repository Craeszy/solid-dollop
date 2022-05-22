/**
 * Express.js框架核心入口模块
 * 1. 导入所需的依赖模块
 * 2. 导入cookie和session模块
 * 3. 导入路由模块
 * 4. 使用中间件(use)
 * 5. 到处app模块
 */

// 1.依赖模块
var express = require('express');   // Express核心(Request, Respose, Router)
var session = require('express-session');   // 官方维护三方模块 session
var SQLiteStore = require('connect-sqlite3')(session);  // 第三方：session存储数据库 流行redis内存数据库,解决session共享
var path = require('path');
var cookieParser = require('cookie-parser');    // 官方维护三方模块
var logger = require('morgan');     // 官方推荐的日志模块

// 导入自定义的路由模块
var indexRouter = require('./routes/index');    // 默认路由，当前应用系统中无用
var usersRouter = require('./routes/users');    // 用户路由模块
var booksRouter = require('./routes/books');    // 书籍路由模块
var bookshelvesRouter = require('./routes/bookshelves');    // 书架路由模块，多对多的关系，例如：订单模块
var reivewsRouter = require('./routes/reviews');    // 评论路由模块

var dbInit = require('./controller/init');  // Sqlite数据库初始化模块

// 创建Express对象app
var app = express();

// Python Flask/Django + chart

// 使用中间件
app.use(logger('dev')); // 日志中间件:dev开发模式
app.use(express.json());    // Express内置中间件，json解析
app.use(express.urlencoded({ extended: false }));   // Express内置中间件，url解析 "？ &" --> %3F+%26 / %3F%20%26 中文 --> utf-8
app.use(cookieParser());    // cookie中间件
app.use(express.static(path.join(__dirname, 'public')));    // 

//注册中间件：创建数据库
app.use(dbInit());

// 构建Session会话，存储在Sqlite数据库中
app.use(session({
    secret: 'Sfsd23@dkljfadajlDvcadfa2ojad#ad!',    // 加盐
    resave: false,  // session处理方式
    saveUninitialized: false,   // session处理方式
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // session 通常需要cookie保存sessionID一周
    store: new SQLiteStore({
        dir: './sqlite',
        db: 'mylibrary.db'
    })
}));

// 路由守卫/路由前置/前置路由
// 所有路由之前执行：跨域访问的设定，巨大的安全问题，
app.all('*', function (req, res, next) {
    let origin = null;

    const allowOrigin = ['http://localhost:8080', 'http://127.0.0.1:8080'];
    if (allowOrigin.find(value => {return value === req.headers.origin })) {
        origin = req.headers.origin;
    }
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 加载定义的路由模块
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/bookshelves', bookshelvesRouter);
app.use('/reviews', reivewsRouter);

// 导出Express 模块
module.exports = app;

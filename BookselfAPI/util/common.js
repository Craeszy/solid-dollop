var debug = require('debug')('expressjs:[系统调试信息]');
var md5 = require('blueimp-md5');


module.exports = {
    getReturnJSONData,
    log,
    getReqRemoteIp,
    md5pwd,
    checkLogin,
    checkIsAdmin
};

/**
 * 获取标准返回JSON格式
 * 200 - 访问成功
 * 201 - 生成新资源
 * 204 - 资源已被删除
 * 400 - 错误请求
 * 401 - 无授权访问
 * 403 - 无权限访问
 * 404 - 资源不存在
 * 
 * @param {Number} code 返回代码
 * @param {String} message 返回的提示信息
 * @param {Object | Array} data 返回的数据
 * @returns Object
 */
function getReturnJSONData(code, message = '', data = []) {
    if (!data) {
        data = [];
    }

    return { code: code, message: message, data: data };
}

/**
 * 调式信息
 * @param {*} msg 
 */
 function log(msg) {
    debug(msg);
}


/**
 * 获取客户端IP地址
 * @param {Express.Request} req 
 * @returns {String} ip
 */
function getReqRemoteIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip;
};

/**
 * 生成md5后的密码
 * @param {String} password 
 * @returns {String} password
 */
function md5pwd(password) {
    const salt = '@SADqqwqed~35@#76ajbkaljf';
    return md5(password, salt);
}


/**
 * 登录检测
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function checkLogin(req, res, next) {
    if (!req.session.isLogin) {
        res.json(getReturnJSONData(401, '无访问授权'));
    }else{
        log(req.session.user);
        next();
    }
}

/**
 * 登录检测
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function checkIsAdmin(req, res, next){
    if (req.session.user.role !== 1) {
        res.json(getReturnJSONData(403, '无访问权限'));
    }else{
        log(req.session.user);
        next();
    }
}






var express = require('express');
var router = express.Router();

const common = require('../util/common');

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  // req.session.username = 'test';
  let data = {
    client_ip: common.getReqRemoteIp(req),
    password: {
      pwd: '123456',
      md5pwd: common.md5pwd('123456')
    },
    root_url: req.url,
    current_route: req.route.path
  };
  res.json(common.getReturnJSONData(200, 'API Design by ExpressJS', data));
});

module.exports = router;

/**
 *  weixin.js 
 *  微信程序应用
 *  author liamhuang
 * 
 * ******/
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/cgi/weixin/auth', function(req, res, next) {
    if( req && req.echostr ){
       res.send( req.echostr );
    }
});

module.exports = router;

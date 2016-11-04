/**
 *  weixin.js 
 *  微信程序应用
 *  author liamhuang
 * 
 * ******/
var express   = require('express');
var router    = express.Router();
var Crypto    = require("crypto");
var xml2js    = require("xml2js");

/* GET users listing. */
router.all('/', function(req, res, next) {
    req       = req ||{};
    req.query = req.query ||{};
    req.body  = req.body ||"";   //这里的body都是通过xml的方式传递的，所以需要设置一下。

    var signature = req.query.signature || "";  //校验的token
    var timestamp = req.query.timestamp || "";  //校验的token
    var echostr   = req.query.echostr   || "";  //随机字符

    res.send( {data:{"test":"fdasfdsa"}} );
});

module.exports = router;

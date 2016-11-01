/**
 *  weixin.js 
 *  微信程序应用
 *  author liamhuang
 * 
 * ******/
var express   = require('express');
var router    = express.Router();
var CryptoJS  = require("crypto-js");

/* GET users listing. */
router.get('/auth', function(req, res, next) {
    req       = req ||{};
    req.query = req.qurey ||{};
    console.log( JSON.stringify( req.query ) );

    var signature = req.query.signature || "";  //校验的token
    var timestamp = req.query.timestamp || "";  //校验的token
    var echostr   = req.query.echostr   || "";  //随机字符
    var nonce     = req.query.nonce     || "";  //随机数
    var token     = "8674521";      //token

    if( signature && timestamp && echostr && nonce){
        var arr = [ token , timestamp , nonce];
        
        arr.sort( function( a , b ){   //将三个按照顺序排列
            return a > b ? 1 : -1;
        });

        var str         = arr.join("");
        var caculateStr = CryptoJS.HmacSHA1(str).toString();

        if( caculateStr == signature ){
            res.send( req.query.echostr );
        }else{
            res.send( "echostr not found");
        }
       
    }else{
        res.send( "echostr not found");
    }
});

module.exports = router;

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
router.get('/', function(req, res, next) {
    req       = req ||{};
    req.query = req.query ||{};
    req.body  = req.body ||"";   //这里的body都是通过xml的方式传递的，所以需要设置一下。

    var signature = req.query.signature || "";  //校验的token
    var timestamp = req.query.timestamp || "";  //校验的token
    var echostr   = req.query.echostr   || "";  //随机字符
    var nonce     = req.query.nonce     || "";  //随机数
    var token     = "8674521";      //token
    var body      = {};
    
    if( req.body ){
        body = xml2js.parseString( req.body );
    }

    console.log( JSON.stringify( body ));

    if( signature && timestamp && echostr && nonce){
        var arr = [ token , timestamp , nonce];
        
        arr.sort( function( a , b ){   //将三个按照顺序排列
            return (a+"") > (b+"")?1:-1 ;
        });

        var str         = arr.join("");
        var caculateStr = Crypto.createHash("sha1").update( str ).digest("hex");
        
        if( caculateStr == signature ){
            res.send( req.query.echostr );
        }else{
            res.send( "compare error, signature is not equal to cacluateStr");
        }
       
    }else{
        res.send( "param is not complete " + JSON.stringify( req.query ));
    }
});

module.exports = router;

/**
 *  weixin.js 
 *  微信程序应用
 *  author liamhuang
 * 
 * ******/
var express   = require('express');
var https     = require("https");
var router    = express.Router();
var Crypto    = require("crypto");
var xml2js    = require("xml2js");
var mysql     = require("../model/mysql_server");
var WXBizDataCrypt = require('../util/WXBizDataCrypt')

var sessionKey = "icHMccqKP3WVOaxd8ZapOA==";
var openId     = "";
var appId      = "wx00dd65d70f19dcec";
var appSecret  = "f6be58d48df16ecbd6a57d83421ca48e";

/* GET users listing. */
router.all('/', function(req, res, next) {
    req       = req ||{};
    var query = req.query ||{};
    var body  = req.body ||"";   //这里的body都是通过xml的方式传递的，所以需要设置一下。

    var signature = req.query.signature || "";  //校验的token
    var timestamp = req.query.timestamp || "";  //校验的token
    var echostr   = req.query.echostr   || "";  //随机字符

    console.log( req.url );
    if( "getTurboList" == query.action &&  query.code ){   //这里进一步的区分数据的类型
        //这里需要从mysql中获取数据，然后返回给前提
        mysql.getAllTurbo( query.code ,query.type , function( ret,rows ){
            
            if( 0 == ret ){
				if( rows && rows.length > 0 ){         //如果获取了数据，就直接展示出来

					var data = [];
					for( var i = 0 ; i < rows.length ; i ++){
						
						var cur = rows[i];
						
						if( cur ){
							data.push( cur );
						}
					}
					
					res.send( {code: 0 ,data: data } );
				}else{               //如果获取了数量为0 ， 则展示对映错误
					res.send( {code: 0 ,data: []} );
				}
			}else{
                console.log("got error ");
				res.send( {code: -1000 ,data: [] , msg:"got data error"} );
			}
        } );

    }else if( "login" == query.action &&  query.code ){ //登陆操作
        var furl = "https://api.weixin.qq.com/sns/jscode2session";
        var data = {
            appid :  appId, 
            secret:  appSecret,
            js_code: query.code||"",
            grant_type: "authorization_code"
        };
        var params = [];
        for( var i in data ){
            var cur = data[i];
            i && params.push( i + "=" + data[i] );
        }

        furl += "?" + params.join("&");
        console.log( furl );
        var req = https.get( furl , function( re ){
            var resultData = '';
            re.on('data', function(chunk) {
                resultData += chunk;
            }).on('end', function( chunk ) {
                try{
                    var result = JSON.parse( resultData );
                    console.log( resultData );
                    sessionKey = result.session_key||"";
                    openId     = result.openid||"";
                    res.send( {code:0 , data: result } );
                }catch(e){
                    console.log("error");
                    res.send( {code:-10001 , msg:"get openid error"});
                }
            });
        });
        
        req.on("timeout", function() {
            console.log("timeout");
            req.res && req.res.emit("abort");
            req.abort();
            res.send( {code:-10002 , msg:"timeout"});
        });

    }else if( "decrypt" == query.action ){
        if( query.iv && query.encryptedData ){
            console.log("query param "+ JSON.stringify( query ));
            
            var pc = new WXBizDataCrypt(appId, sessionKey);
            var data = pc.decryptData( query.encryptedData , query.iv);
            res.send( {"code":0 , "data": data});
        }else{
            console.log( "decrypt param error");
            res.send( {code:-10003 , msg:"dcrypt param error"});
        }

    }else{
        console.log("action error ");
        res.send( {code: -10000 ,data: [] , msg:"action error"} );
    }
});

module.exports = router;

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
var mysql     = require("../model/mysql_server");

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

    }else{
        console.log("action error ");
        res.send( {code: -1000 ,data: [] , msg:"action error"} );
    }
   
    
});

module.exports = router;

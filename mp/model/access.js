/**
 * model.js
 * 这个主要是为了做一些公用的方法,
 * 比如更新token之类的
 * **/
var request    = require("request");
var token      = null;
var updateTime = null;   //上次更新时间，每次都有两个小时的有效期，也就是 7200s的时间。这里设置每半个小时更新一下
var expires_in = null;   //返回的过期时间

/**
 * 从内存中获取当前的token，因为微信有每日2000次的限制。
 * *
 * ***/
module.exports.getToken = function( cb ){

    if( token && Date.now() - updateTime <= 3600 ){   //这里默认如果过了一个小时，就在一个小时内部更新
        cb && cb( {
            "code": 0,
            "token": token
        });
    }else{
        refreshToken( function( result ){
            if( result && result.access_token ){
                token      = result.access_token;
                expires_in = result.expires_in;
                updateTime = Date.now();

                cb && cb( {
                    "code": 0,
                    "token": token
                } ); 
            }else{
                cb && cb( { code: -1 , msg: "got token error"} ); 
            }
        });
    }
}

//刷新token，这个是强制从微信服务器换取新的token。然后暂存在本地。
function refreshToken( cb ){
    var url   = "https://api.weixin.qq.com/cgi-bin/token";
    var appId = "wx6bbf6e7561392a5b";
    var secret= "0028cab87b3600319c82a4772de2019f";

    var param = { "grant_type" : "client_credential",
                  "appid"      : appId,
                  "secret"     : secret        
    };
    var arr   = [];
    for( var i in param ){
        if( i && param[i] ){
            arr.push( i + "=" + param[i] );
        }
    } 

    url += "?" + arr.join("&");
    console.log( url );
    request( url , function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log( body );
            try{
                var result = JSON.parse( body );
            }catch(e){
                var result = {};
            }
            
            cb && cb( result );    
        }else{  //加入出错重试机制
            

        }
    });      
};


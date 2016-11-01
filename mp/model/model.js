/**
 * model.js
 * 这个主要是为了做一些公用的方法,
 * 比如更新token之类的
 * **/
var request = require("http").request;

var token = null;
var updateTime = null;   //上次更新时间，每次都有两个小时的有效期，也就是 7200s的时间。这里设置每半个小时更新一下

/**
 * 从内存中获取当前的token，因为微信有每日2000次的限制。
 * *
 * ***/
export function getToken( cb ){

    if( token && Date.now() - updateTime <= 3600 ){   //这里默认如果过了一个小时，就在一个小时内部更新
        cb && cb( token );
    }else{
        refreshToken( function( tk ){
            if( tk && tk.length ){
                token = tk;
                updateTime = Date.now();
            }
        });
    }
}


//刷新token，这个是强制从微信服务器换取新的token。然后暂存在本地。
export function refreshToken( cb ){
    var url   = "https://api.weixin.qq.com/cgi-bin/token";
    var appId = "wx6bbf6e7561392a5b";
    var secret= "8674521";

    var param = { "grant_type" : "client_credential",
                  "appid"      : appId,
                  "secret"     : secret        
    };

    

}


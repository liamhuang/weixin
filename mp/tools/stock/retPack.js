/****
*	retpack.js 
*	回包方法合集
*	包括： 静态文件，  返回json格式数据 ， 404 ， 302
****/ 
var errMsg = require("./error.js"); 
var fs          = require("fs");
var url         = require("url");
var querystring = require("querystring");    //用于参数解析的函数 


/**
*	返回json格式的数据
*
*/
exports.returnJson = function( res , opt  ,  callbackStr){
	callbackStr = callbackStr || "_callback"
	opt = opt ||{};
	if( opt.code || opt.code < 0  ){    //如果返回码是出错的，就在errormsg中找到错误，然后把内容写回到message中去
		if( !opt.msg && errMsg.ERR_MSG[ opt.code ]){
			opt.msg = errMsg.ERR_MSG[opt.code];
		}
	}

	res.writeHead( 200 , { "Content-Type": "application/x-javascript" ,"max-age":0});
	res.write( callbackStr + "("+JSON.stringify( opt ) +")" ,"utf-8");
	res.end();
};


/**
*	404 找不到文件的时候，返回这个
*
***/
exports.return404 = function( req ,res){
	res.writeHead(404, {"Content-Type": "text/html","charset":"utf-8"});
	res.write("您所请求的CGI不存在，请查找后确认");
	res.end();
};



/**
*	返回静态文件
*
*
**/
exports.returnStaticFile = function( request , response  ){
	var pathName = url.parse( request.url ).pathname;
	
	fs.exists( "./"+pathName, function( exists ){
		if(exists){
			fs.readFile("./"+pathName ,"",function( err , data){
				if( data ){
					if( /\.html$/.test( pathName )){
						response.writeHead(200, {"Content-Type": "text/html","max-age":36000});
					}else if( /\.js$/.test( pathName )){
						response.writeHead(200, {"Content-Type": "application/x-javascript","max-age":36000});
					}else if( /\.css$/.test(pathName)){
						response.writeHead(200, {"Content-Type": "text/css","max-age":36000});
					}else if( /\.jpg$/.test(pathName)){
						response.writeHead(200, {"Content-Type": "image/jpg","max-age":36000});
					}else if( /\.png$/.test(pathName)){
						response.writeHead(200, {"Content-Type": "image/png","max-age":36000});
					}
					response.write( data );
					response.end();
				}
			});
		}else{
			exports.return404(request ,response);
		}
	
	});
};
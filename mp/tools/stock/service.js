/****
*	名字管理系统，这里实现如下的功能
*	1.客户端文字名字，手机，QQ的录入方式,还有删除
*	2.点击打开QQ聊天窗口，打开邮箱，直接发送邮件给某个人
*	3.名字系统的保存
*	4.文字的查找,可以按照名字,按照QQ号码,按照时间查找,按照手机号码查找
*   5.文件的备份
*
********/

//使用的原理，启动之后，读取文件列表中的文件，然后保存在变量里面。
//当有请求出来的时候，就展示出来所有的列表。并且有不同的操作,排序，展示.........

var http        = require("http");  //http请求，主要是为了完成
var fs          = require("fs");
var url         = require("url");
var querystring = require("querystring");    //用于参数解析的函数 
var retPack     = require("./retPack.js");   //回包方法
var mysql       = require("./mysql_server.js");    //访问数据库

var cgiConfig = {"getAllTurbo" : { "mainProc": function( response , param ,callback ){
	console.log("in cgi proc");
	//数据合法性校验
	if( !param || !param.target ){
		
		retPack.returnJson( response  , {"code": -1002 ,"msg":"param error"});
		return;
	
	}
	param.type = param.type || 0;
	
	mysql.getAllTurbo( param.target , param.type , function( ret , rows ){
			console.log( "mysql  return :" + ret );
			if( 0 == ret ){
				if( rows && rows.length > 0 ){         //如果获取了数据，就直接展示出来

					var data = [];
					for( var i = 0 ; i < rows.length ; i ++){
						
						var cur = rows[i];
						
						if( cur ){
							
							data.push( cur );
							
						}
					}
					
					retPack.returnJson( response  , {"code": 0 , "data": data});
				
				}else{               //如果获取了数量为0 ， 则展示对映错误
				
					retPack.returnJson( response, { "code": 0 , "data": [] , "msg":"no items you want"} ) ; 
				
				}
			
			}else{
				
				retPack.returnJson( response ,{ "code": ret , "msg":"no result"} ) ; 
			
			}
		
	});

}}};

//根据cgi的名字来获取对映的处理方式
var cgiProc = function( request  , response){
	
	var pathName = url.parse( request.url ).pathname;
	var temArr   = pathName.split("/");
	var cgiName  = (temArr[temArr.length -1 ]||"").split("?")[0];
	var urlParam = url.parse( request.url ).search.replace("?" , '');

	var curCgi   = cgiConfig[ cgiName ];
	var param    = {};                     //param是参数列表包含了两个部分，一部分是url中的，一部分是data中的

	var paramList= urlParam && urlParam.split("&");
	for( var i = 0 ; i < paramList.length ; i ++){
		if( paramList[i] ){
		
			var cur = paramList[i].split("=");
			if( cur && cur[0] && cur[1] && !param[ cur[0] ]){
				
				param[ cur[0]] = cur[1];
			
			}
		}
	}
	
	var data     = '';
	request.addListener("data",function(proData){
		data += proData;
	});
	
	request.addListener("end",function(){
		tem    = querystring.parse( data );
		for( var i  in  tem){
			
			param[ i ] = tem[i];
		
		}
		if( curCgi.mainProc ){
		
			console.log("start to use cgi " + JSON.stringify( param ) );
			curCgi.mainProc( response , param );
	
		}
	});
	return;
};


/**
*	使用方式，输入url的后面
*	return: function
**/
var router = function( pathName ){
	//这里分成两类，一类静态文件，包括html ,css ,js,jpg等静态资源，直接返回文件
	//另外一类文件，后台的cgi，使用名字来匹配处理
	var staticFile = /(\.ico|\.html|\.css|\.js|\.jpg|\.png|\.htm|\.gif)$/;
	var temArr = pathName.split("/");
	var name   = (temArr[temArr.length -1 ]||"").split("?")[0];

	if( cgiConfig[ name ]){
		
		return cgiProc;
		
	}else if( staticFile.test( pathName ) ){
		return retPack.returnStaticFile;
	}else{
		return retPack.return404;
	}
	
};

var server = http.createServer( function( request , response){
	var pathName = url.parse( request.url ).pathname;
	var handler = null;
	if( handler = router( pathName )){
		handler( request , response );
	}else{ 
		retPack.return404(request , response);
	}

}).listen(8081);

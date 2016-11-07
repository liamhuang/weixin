/**
*	用来获取当前的比特币的状况的
*	这个的主要功能就是定期拉取url
*
*/

var http  = require("http");       //http请求，用来获取信息，并且创建服务器
var url   = require("url");       //解析url
var mysql = require("./mysql_server.js");   //写入数据库

var easyUTF8 = function( gbk ){  
    if(!gbk){return '';}  
    var utf8 = [];  
    for(var i=0;i<gbk.length;i++){  
        var s_str = gbk.charAt(i);  
        if(!(/^%u/i.test(escape(s_str)))){utf8.push(s_str);continue;}  
        var s_char = gbk.charCodeAt(i);  
        var b_char = s_char.toString(2).split('');  
        var c_char = (b_char.length==15)?[0].concat(b_char):b_char;  
        var a_b =[];  
        a_b[0] = '1110'+c_char.splice(0,4).join('');  
        a_b[1] = '10'+c_char.splice(0,6).join('');  
        a_b[2] = '10'+c_char.splice(0,6).join('');  
        for(var n=0;n<a_b.length;n++){  
            utf8.push('%'+parseInt(a_b[n],2).toString(16).toUpperCase());  
        }  
    }  
    return utf8.join('');  
};  
//获取数据
function _getFinanceData( id , tar , tuborName ,cType ){
	
	if( !id ){  return ;}
	var r    = Math.random();
	var furl = 'http://qt.gtimg.cn/r='+ r +'&q=r_hk'+id;
	
	var req = http.get( furl , function( re ){
		
		var fileData = '';
		
		re.on('data', function(chunk) {
		
			fileData += chunk;
			
		}).on('end', function( chunk ) {
			console.log	("turbodetail:::::got")	
			chunk = chunk ||"";
			
			fileData += chunk;
			
			if( fileData  && fileData.length ){
				var data    = fileData.split("=")[1]||"";
				var dataArr = data.split("~")||[];
				
				var obj     = {
					name           :  easyUTF8(tuborName),  //名称
					target         :  tar ,        //标
					code           :  dataArr[2],  //代码
					curPrice       :  dataArr[3],  //当前价格，
					yesterdayPrice :  dataArr[4],  //昨日收于
					todayFirstPrice:  dataArr[5],  //今日开盘价
					dealMount      :  dataArr[6],  //交易量（手）
					buyOnePrice    :  dataArr[9],  //买一（股）价
					buyOneMount    :  dataArr[29], //买一（手）数量
					sellOnePrice   :  dataArr[19], //卖一（股）价格
					sellOneMount   :  dataArr[20], //卖一 （手）数量
					lastDealtime   :  dataArr[30], //最后交易时间
					upDown         :  dataArr[31], //涨跌
					upDownPercent  :  dataArr[32], //涨跌比率
					highest        :  dataArr[33], //最高价
					lowest         :  dataArr[34], //最低价
					dealMoney      :  dataArr[37], //成交额
					huanshouRate   :  dataArr[38], //还手率
					PE             :  dataArr[39], //市盈率
					exchange       :  dataArr[44], //行权比例
					exchangePrice  :  dataArr[45], //行权价
					finalDate      :  dataArr[47], //行权日期
					time           :  Date.now(),   //写入时间戳
					type           :  cType
				};
				mysql.insertTurbo( obj );
			}
		});
	});
	
	req.on("timeout", function() {
 
       req.res && req.res.emit("abort");
       req.abort();
	   
    });
};

//通过智能查询方法，把对应的条目查出来
var _getQueryList = function( tar , bank ,  year , month , type){
	if( !tar ||  !bank || !month ){
		return;
	}
	
	type = type||0;

	var queryStr = tar + bank + dateMap[ year ] + dateMap[month] + typeMap[ type ]; 
	var furl = 'http://smartbox.gtimg.cn/s3/?v=2&q='+ encodeURIComponent( queryStr ) +'&t=all';
	console.log("cur url is "+ furl);
	var req  = http.get( furl , function( re ){
	
		var fileData = '';
		
		re.on('data', function( chunk ) {
		
			fileData += chunk;
			
		}).on('end', function( chunk ) {
						
			chunk = chunk ||"";
			
			fileData += chunk;
			var reg = new RegExp(/hk~(\d+?)~/g)
	
			while( (result = reg.exec( fileData )) != null ){
			
				if( result[1] ){
					console.log("cur code is "+ result[1]);
					_getFinanceData( result[1] *1  , 700 , queryStr ,type);            //获取对应的权证数据，然后写入数据库
				
				}
			
			}
		});
	
	});
	
	req.on("timeout", function() {
	  
       req.res && req.res.emit("abort");
       req.abort();
	   
    });
}

//获取日期
var dateMap     = {
	0   : "零",
	1	: "一",
	2   : "二",
	3   : "三",
	4   : "四",
	5   : "五",
	6   : "六",
	7   : "七",
	8   : "八",
	9   : "九",
	10  : "十",
	11  : "甲",
	12  : "乙"
};

var typeMap = {
	0 : "购",
	1 : "沽",
	2 : "牛",
	3 : "熊"
}

var date    = new Date();
var curYear    = date.getFullYear()%10;
var curMonth   = date.getMonth() + 1;

//获取发行商,并且将发行商的名字放在这里
var bankStr = "腾讯大和四乙购A 港股 腾讯瑞信四四购D 港股 腾讯汇丰四六购A 港股 腾讯东亚四甲购A 港股 腾讯摩通四五购C 港股 腾讯瑞银四六购C 港股 腾讯瑞信四六购C 港股 腾讯瑞信四四沽F 港股 腾讯瑞信四甲购A 港股 腾讯法兴四七沽F 港股 腾讯花旗四四购C 港股 腾讯中银四五沽A 港股 腾讯瑞银四六购D 港股 腾讯瑞信四四购G 港股 腾讯瑞信四八购B 港股 腾讯瑞信四六沽I 港股 腾讯瑞银四一购A 港股 腾讯汇丰四六沽C 港股 腾讯瑞银四七沽B 港股 腾讯法兴四九购A 港股 腾讯汇丰四四沽H 港股 腾讯瑞信四六购J 港股 腾讯高盛四六沽F 港股 腾讯渣打四四购E 港股 腾讯瑞银四九购A 港股 腾讯法巴五一购A 港股 腾讯美林四七购A 港股 腾讯大和四五购C 港股 腾讯大和四六沽D 港股 腾讯麦银四八沽A 港股 腾讯中银四七购A 港股 腾讯花旗四六购C 港股 腾讯美林四二购A 港股 腾讯法巴四三购A 港股 腾讯渣打四一购A 港股 腾讯瑞信四六购A 港股 腾讯瑞银四一购B 港股 腾讯花旗四一沽A 港股 腾讯大和四六购A 港股 腾讯高盛四一购A 港股 腾讯花旗四三购A 港股 腾讯渣打四一购B 港股 腾讯大和四三沽A 港股 腾讯野村四四购A 港股 腾讯瑞信四二购A 港股 腾讯法巴四二沽B 港股 腾讯法巴四一购D 港股 腾讯法兴四四购A 港股 腾讯法兴四二沽D 港股 腾讯瑞银四二购C 港股 腾讯花旗四二沽A 港股 腾讯渣打四二购B 港股 腾讯高盛四二沽C 港股 腾讯高盛四二沽D 港股 腾讯法兴四五购A 港股 腾讯花旗四二购D 港股 腾讯法巴四四购A 港股 腾讯瑞信四二购D 港股 腾讯花旗四二沽E 港股 腾讯渣打四二购E 港股 腾讯麦银四三购A 港股 腾讯汇丰四一购D 港股 腾讯渣打四六沽A 港股 腾讯高盛四二沽F 港股 腾讯中银四二沽A 港股 腾讯花旗四二购F 港股 腾讯瑞银四二沽G 港股 腾讯麦银四七沽A 港股 腾讯法巴四四购C 港股 腾讯瑞信四三购B 港股 腾讯汇丰四四购A 港股 腾讯大和四二沽C 港股 腾讯高盛四四购A 港股 腾讯摩通四四购C 港股 腾讯瑞信四三购C 港股 腾讯高盛四四沽B 港股 腾讯法巴四四购E 港股 腾讯瑞银四四购A 港股 腾讯花旗四七购A 港股 腾讯汇丰四三购B 港股 腾讯美林四二沽C 港股 腾讯汇丰四二沽D 港股 腾讯汇丰四四沽C 港股 腾讯摩通四七购A 港股 腾讯瑞银四四沽B 港股 腾讯高盛四四沽D 港股 腾讯法巴四五购A 港股 腾讯瑞信四三沽E 港股 腾讯高盛四三购A 港股 腾讯渣打四五购A 港股 腾讯渣打四四购D 港股 腾讯汇丰四三沽C 港股 腾讯瑞信四三购F 港股 腾讯大和四四购D 港股 腾讯麦银四六购A 港股 腾讯法兴四六购A 港股 腾讯高盛四六沽B 港股 腾讯瑞信四四沽B 港股 腾讯法兴四五购D 港股 腾讯汇丰四十牛B 港股 腾讯瑞银四六牛M 港股 腾讯汇丰四九牛G 港股 腾讯瑞银四七牛H 港股 腾讯汇丰四十牛C 港股 腾讯瑞银四九熊A 港股 腾讯汇丰四四牛A 港股 腾讯瑞银四六牛I 港股 腾讯瑞银四六牛A 港股 腾讯瑞银四六牛J 港股 腾讯汇丰四七熊A 港股 腾讯瑞银四七牛J 港股 腾讯瑞银四六牛N 港股 腾讯汇丰四九熊A 港股 腾讯瑞银四四熊D 港股 腾讯瑞银四八牛B 港股 腾讯汇丰四九熊J 港股 腾讯汇丰四九牛B 港股 腾讯花旗四九牛A 港股 腾讯汇丰四二牛B 港股 腾讯汇丰四七牛C 港股 腾讯汇丰四三牛B 港股 腾讯汇丰四九牛C 港股 股票名称 市场 腾讯法兴四七购D 港股 腾讯花旗四四沽A 港股 腾讯法巴四六沽A 港股 腾讯汇丰四五沽A 港股 腾讯摩通四七沽B 港股 腾讯汇丰四六沽B 港股 腾讯瑞银四四沽E 港股 腾讯瑞信四四购E 港股 腾讯高盛四四购E 港股 腾讯法兴四乙购A 港股 腾讯花旗四六沽A 港股 腾讯麦银四七购C 港股 腾讯高盛四六沽C 港股 腾讯高盛四六购D 港股 腾讯瑞信四四购H 港股 腾讯瑞信四六沽H 港股 腾讯大和四二购A 港股 腾讯法巴四乙购A 港股 腾讯汇丰四七沽B 港股 腾讯瑞银四六沽E 港股 腾讯摩通四七沽D 港股 腾讯汇丰四七沽C 港股 腾讯法巴四八购B 港股 腾讯高盛四七沽A 港股 腾讯瑞银四七购C 港股 腾讯法兴四八沽A 港股 腾讯摩通四六购B 港股 腾讯汇丰四六购E 港股 腾讯大和四六购C 港股 腾讯瑞银五六购A 港股 腾讯法兴四七购G 港股 腾讯摩通四七购E 港股 腾讯摩通四二购A 港股 腾讯美林四一购A 港股 腾讯瑞信四一购A 港股 腾讯法巴四二购A 港股 腾讯高盛四二购A 港股 腾讯摩通四二购B 港股 腾讯花旗四一购B 港股 腾讯野村四三沽B 港股 腾讯法巴四七购A 港股 腾讯高盛四二沽B 港股 腾讯摩通四三购A 港股 腾讯渣打四二沽A 港股 腾讯瑞银四一沽C 港股 腾讯麦银四二购A 港股 腾讯汇丰四一购A 港股 腾讯瑞银四一购D 港股 腾讯法兴四二购B 港股 腾讯瑞信四一沽D 港股 腾讯摩通四四沽A 港股 腾讯花旗四二沽B 港股 腾讯瑞银四二沽D 港股 腾讯高盛四五购A 港股 腾讯汇丰四二购B 港股 腾讯大和四三购B 港股 腾讯渣打四一购C 港股 腾讯法巴四四沽B 港股 腾讯瑞信四一沽F 港股 腾讯摩通四二沽D 港股 腾讯高盛四二购E 港股 腾讯瑞银四二沽F 港股 腾讯渣打四四购A 港股 腾讯瑞银四三购A 港股 腾讯法兴四三购A 港股 腾讯中银四二购B 港股 腾讯大和四四购A 港股 腾讯瑞信四三购A 港股 腾讯中银四二沽C 港股 腾讯法巴四四沽D 港股 腾讯花旗四三购B 港股 腾讯法兴四四沽B 港股 腾讯渣打四三购A 港股 腾讯麦银四四购A 港股 腾讯摩通四四沽D 港股 腾讯瑞银四二沽H 港股 腾讯渣打四四购B 港股 腾讯法兴四五购B 港股 腾讯中银四四购A 港股 腾讯瑞信四二沽F 港股 腾讯麦银四七沽B 港股 腾讯美林四二购D 港股 腾讯高盛四四购C 港股 腾讯摩通四五购A 港股 腾讯美林四四购A 港股 腾讯摩通四五沽B 港股 腾讯大和四五购A 港股 腾讯法巴四四沽F 港股 腾讯法兴四五购C 港股 腾讯美林四六购A 港股 腾讯渣打四四沽C 港股 腾讯渣打四六购B 港股 腾讯汇丰四四沽F 港股 腾讯汇丰四四购G 港股 腾讯瑞银四三购E 港股 腾讯大和四五沽B 港股 腾讯法兴四七沽B 港股 腾讯美林四五沽A 港股 腾讯瑞信四四沽C 港股 腾讯大和四六沽B 港股 腾讯汇丰四九牛D 港股 腾讯瑞银四七牛G 港股 腾讯汇丰四八牛D 港股 腾讯瑞银四六熊F 港股 腾讯汇丰四八牛E 港股 腾讯瑞银四八熊A 港股 腾讯瑞银四六牛H 港股 腾讯汇丰四甲熊A 港股 腾讯汇丰四六牛A 港股 腾讯汇丰四六熊B 港股 腾讯瑞银四六牛C 港股 腾讯汇丰四二牛A 港股 腾讯瑞银四七熊B 港股 腾讯汇丰四十牛A 港股 腾讯瑞银四六牛O 港股 腾讯汇丰四九熊H 港股 腾讯汇丰四九熊K 港股 腾讯汇丰四八牛B 港股 腾讯瑞银四八熊B 港股 腾讯汇丰四二牛C 港股 腾讯瑞银四三牛A 港股 腾讯瑞银四六牛F 港股 股票名称 市场 腾讯法兴四六沽B 港股 腾讯花旗四四购B 港股 腾讯法兴四五购E 港股 腾讯中银四六购A 港股 腾讯摩通四七购C 港股 腾讯汇丰四八购A 港股 腾讯渣打四六沽C 港股 腾讯瑞信四六沽D 港股 腾讯瑞信四八购A 港股 腾讯法兴四七沽E 港股 腾讯花旗四六沽B 港股 腾讯瑞信四六购E 港股 腾讯瑞银四七购A 港股 腾讯瑞信四六购F 港股 腾讯瑞信四六购G 港股 腾讯瑞信四五沽A 港股 腾讯野村四六购A 港股 腾讯大和四二购B 港股 腾讯汇丰四六购D 港股 腾讯花旗四四购D 港股 腾讯摩通四四购F 港股 腾讯高盛四六购E 港股 腾讯法巴四七沽B 港股 腾讯渣打四六沽D 港股 腾讯瑞银四七沽D 港股 腾讯瑞信四七沽A 港股 腾讯美林四六沽B 港股 腾讯汇丰四四购I 港股 腾讯大和四七沽A 港股 腾讯瑞信四七购B 港股 腾讯瑞信四七购C 港股 腾讯瑞信四四购I 港股 腾讯美林四三沽A 港股 腾讯汇丰四七购A 港股 腾讯瑞银四六购A 港股 腾讯野村四三购A 港股 腾讯野村四二购A 港股 腾讯摩通四二沽C 港股 腾讯瑞银四二购A 港股 腾讯瑞银四二购B 港股 腾讯瑞信四一购B 港股 腾讯法兴四二购A 港股 腾讯摩通四六购A 港股 腾讯野村四二购B 港股 腾讯瑞信四一购C 港股 腾讯法巴四八购A 港股 腾讯汇丰四一购B 港股 腾讯汇丰四一沽C 港股 腾讯法兴四二沽C 港股 腾讯瑞信四二购B 港股 腾讯摩通四三沽B 港股 腾讯汇丰四二沽A 港股 腾讯瑞信四一沽E 港股 腾讯渣打四二沽C 港股 腾讯汇丰四二沽C 港股 腾讯花旗四五购A 港股 腾讯渣打四二沽D 港股 腾讯瑞信四二购C 港股 腾讯瑞银四二购E 港股 腾讯摩通四二购E 港股 腾讯渣打四二沽F 港股 腾讯瑞银四一购E 港股 腾讯渣打四八购A 港股 腾讯高盛四一购B 港股 腾讯东亚四六购A 港股 腾讯瑞信四一购G 港股 腾讯瑞银四三购B 港股 腾讯汇丰四三购A 港股 腾讯摩通四四购B 港股 腾讯瑞信四二沽E 港股 腾讯瑞银四三购C 港股 腾讯大和四四购B 港股 腾讯渣打四三购B 港股 腾讯渣打四三沽C 港股 腾讯法兴四四购C 港股 腾讯瑞银四三沽D 港股 腾讯法兴四四沽D 港股 腾讯花旗四三购C 港股 腾讯汇丰四四沽B 港股 腾讯瑞信四三购D 港股 腾讯美林四二沽B 港股 腾讯美林四三购B 港股 腾讯法兴四七购A 港股 腾讯摩通四四沽E 港股 腾讯美林四四沽B 港股 腾讯中银四四沽B 港股 腾讯大和四四沽C 港股 腾讯瑞信四四购A 港股 腾讯瑞银四四购C 港股 腾讯汇丰四四购D 港股 腾讯瑞信四六购B 港股 腾讯汇丰四四购E 港股 腾讯野村四四购B 港股 腾讯大和四三购C 港股 腾讯摩通五六购A 港股 腾讯瑞银四四沽D 港股 腾讯高盛四六购A 港股 腾讯法兴四七沽C 港股 腾讯瑞银四六沽B 港股 腾讯瑞银四七牛F 港股 腾讯汇丰四九牛E 港股 腾讯汇丰四九牛F 港股 腾讯汇丰四八熊D 港股 腾讯瑞银四八牛A 港股 腾讯汇丰四十熊C 港股 腾讯瑞银四七牛I 港股 腾讯汇丰四四牛B 港股 腾讯汇丰四十牛D 港股 腾讯瑞银四六牛B 港股 腾讯瑞银四七熊A 港股 腾讯瑞银四九熊B 港股 腾讯瑞银四六牛D 港股 腾讯瑞银四五熊A 港股 腾讯汇丰四九牛I 港股 腾讯汇丰四八牛F 港股 腾讯汇丰四九熊I 港股 腾讯汇丰四八牛A 港股 腾讯瑞银四五熊D 港股 腾讯瑞银四七牛A 港股 腾讯汇丰四八牛C 港股 腾讯汇丰四三牛A 港股 腾讯瑞银四七牛E 港股"
var bankList= [];
var bankMap = {};
var result  = null;
var reg     = new RegExp(/腾讯(.+?)(四|五)/g);
while( (result = reg.exec( bankStr )) != null ){

	if( result[1] && !bankMap[result[1]] ){
		
		bankMap[result[1]] = 1;
		bankList.push( result[1] );	
	}
	
}

//将所有的发行商的数据和日期结合起来查询
function getTencentTurbo(){

	//权证，购
	for( var i = 0 ; i < bankList.length ; i++){
		for(var k = curYear ; k <= curYear+2 ; k++){
			for( var j = 1 ; j <= 12 ; j++){
				console.log( "腾讯||"+ k +"||"+j)
				_getQueryList( "腾讯" , bankList[i] ,  k , j , 0);
			}	
		}
	}

	setTimeout( function(){
		//权证，沽
		for( var i = 0 ; i < bankList.length ; i++){
			for(var k = curYear ; k <= curYear+2 ; k++){
				for( var j = 1 ; j <= 12 ; j++){
					console.log( "腾讯||"+ k +"||"+j)
					_getQueryList( "腾讯" , bankList[i] ,  k , j , 1);	
				}	
			}
		}
	} , 5000);
	
	setTimeout( function(){
		//权证，牛
		for( var i = 0 ; i < bankList.length ; i++){
			for(var k = curYear ; k <= curYear+2 ; k++){
				for( var j = 1 ; j <= 12 ; j++){
					console.log( "腾讯||"+ k +"||"+j)
					_getQueryList( "腾讯" , bankList[i] ,  k , j , 2);
				}	
			}
		}
	} , 10000);

	setTimeout( function(){
		//权证，熊
		for( var i = 0 ; i < bankList.length ; i++){
			for(var k = curYear ; k <= curYear+2 ; k++){
				for( var j = 1 ; j <= 12 ; j++){
					console.log( "腾讯||"+ k +"||"+j)
					_getQueryList( "腾讯" , bankList[i] ,  k , j , 3);
				}	
			}
		}
	} , 15000);
}


function writeToDataBase( obj ){
	
	if( obj && obj.target && obj.code ){
		
		
	
	
	}

}

getTencentTurbo();
//getJRTurbo();


/**
*	用来获取当前的比特币的状况的
*	这个的主要功能就是定期拉取url
*
*/

var https  = require("https");       //http请求，用来获取信息，并且创建服务器
var url   = require("url");       //解析url
var cheerio = require("cheerio");

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


var textArr = [
	'天',
	'时间(CST)',	
	'气温',	
	'风冷温',	
	'露点',	
	'湿度',	
	'气压',	
	'能见度',	
	'Wind Dir',	
	'风速',	
	'瞬间风速',	
	'Precip',	
	'活动',	
	'状况'
];



//获取数据
function getWeaterData( year , month , day){

	if( day < 10 ){
		day = "0"+day;
	}
	var furl = 'https://www.wunderground.com/history/airport/ZSQD/'+year+'/'+month+'/'+ day +'/DailyHistory.html?req_city=青岛&req_statename=China&reqdb.zip=00000&reqdb.magic=12&reqdb.wmo=54857';
	
	var req  = https.get( furl , function( re ){
		
		var fileData = '';
		
		re.on('data', function(chunk) {
		
			fileData += chunk;
			
		}).on('end', function( chunk ) {
			var $ = cheerio.load( fileData );
			var trs = $("#observations_details tr");  //每一列的数据
			var tarMap = {};
			//将每一列的数据展示出来
			trs.each( function(   i ,item ){
				if( item ){
					var list = $(item).find( "td");
					var time = $( list[0] ).html();
					
					if( time && list.length ){
						tarMap[time] = [];

						list.each( function( j , tar ){
							var val = null;
							if( $(tar).find("span.wx-value").length ){
								val = $( $(tar).find("span.wx-value")[0]).html().replace(/\s/ig , "").replace(/\r/ig , "" ).replace(/\t/ig , "").replace(/\n/ig , "");
							}else{
								val = $(tar).html()||"-";
								val = val.replace(/\s/ig, "").replace(/\r/ig , "" ).replace(/\r/ig , "" ).replace(/\t/ig , "").replace(/\n/ig , "");
							}

							tarMap[time].push( val );
						});
					}
				}
			});

			//将map转化成数组
			var tarArr = [];
			for(var i in tarMap ){
				var tar  = tarMap[i];
				if( tar && tar.length ){
					tar.unshift( [year,month ,day].join("-"));
					tarArr.push( tar.join(",").replace(/\s/ig, "").replace(/\r/ig , "" ).replace(/\r/ig , "" ).replace(/\t/ig , "").replace(/\n/ig , "") );	
				} 
			}
			
			console.log( tarArr.join("\n"));
			var tarDay= new Date( year ,month -1 ,day ).getTime();
			var end   = Date.now();    //截止日期，今天
			if( tarDay <= Date.now() ){
				var nextDay = new Date( tarDay + 86400000 );
				getWeaterData( nextDay.getFullYear() , nextDay.getMonth()+1 , nextDay.getDate() );
			}
		});
	});
	
	req.on("timeout", function() {
 
       req.res && req.res.emit("abort");
       req.abort();
	   
    });
};


var start = new Date( 2011 , 0 , 1 ).getTime(); //2011年开始


getWeaterData( 2014 , 3 , 1 );






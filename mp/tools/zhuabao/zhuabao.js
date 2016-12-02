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


//获取数据
function getWeaterData( year , month , day){

	var r    = Math.random();
	var furl = 'https://www.wunderground.com/history/airport/ZSQD/2016/12/01/DailyHistory.html?req_city=青岛&req_statename=China&reqdb.zip=00000&reqdb.magic=12&reqdb.wmo=54857';
	
	var req = https.get( furl , function( re ){
		
		var fileData = '';
		
		re.on('data', function(chunk) {
		
			fileData += chunk;
			
		}).on('end', function( chunk ) {
			chunk = chunk ||"";
			
			fileData += chunk;
			var res = cheerio.load( chunk );
			
			console.log( fileData );
		});
	});
	
	req.on("timeout", function() {
 
       req.res && req.res.emit("abort");
       req.abort();
	   
    });
};

getWeaterData();



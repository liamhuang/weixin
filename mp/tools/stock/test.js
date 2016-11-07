var http  = require("http");       //http请求，用来获取信息，并且创建服务器
var url   = require("url");       //解析url
var mysql = require("./mysql_server.js");   //写入数据库

var easyUincode = function( gbk ){  
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

function UnicodeToUTF8(strInUni){
	if(null==strInUni)
		returnnull;
	var strUni=String(strInUni);
	var strUTF8=String();
	for(var i=0;i<strUni.length;i++){
		var wchr=strUni.charCodeAt(i);
		if(wchr<0x80){
		  strUTF8+=strUni.charAt(i);
		  }
		else if(wchr<0x800){
		  var chr1=wchr&0xff;
		  var chr2=(wchr>>8)&0xff;
		  strUTF8+=String.fromCharCode(0xC0|(chr2<<2)|((chr1>>6)&0x3));
		  strUTF8+=String.fromCharCode(0x80|(chr1&0x3F));
		  }
		else{
		  var chr1=wchr&0xff;
		  var chr2=(wchr>>8)&0xff;
		  strUTF8+=String.fromCharCode(0xE0|(chr2>>4));
		  strUTF8+=String.fromCharCode(0x80|((chr2<<2)&0x3C)|((chr1>>6)&0x3));
		  strUTF8+=String.fromCharCode(0x80|(chr1&0x3F));
		  }
    }
	return strUTF8;
}

http.get( "http://qt.gtimg.cn/r=0.7922556204721332&q=r_hk28347" , function( re){
	var fileData = '';
	re.on('data', function(chunk) {
		
		fileData += chunk;
			
	}).on('end', function( chunk ) {
		
		fileData += chunk;
		mysql.getAllTurbo( {code: 700}, function( ret , list){
			
			if( 0 == ret ){
			
				
				console.log(" code 700 :" + list.length );
				
			}
		
		});
		
	});
	
});
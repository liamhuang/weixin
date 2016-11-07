var http = require("http");
var url  = "http://smartbox.gtimg.cn/s3/?q=tx&t=all";
http.get( url , function( re ){

	var finalData = "";
	
	re.on("data" , function(data){

		finalData += data;
	});

	re.on("end" , function(data){
		finalData += data;
		console.log("final Data is "+ finalData);
	})


});

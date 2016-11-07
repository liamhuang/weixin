/**
*	这是一个server，专门用来查询数据库，故叫做mysqlserver
*	
*
*/
//加载mysql Module
var mysql  = require("mysql");
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '3306',
	database : 'stock',
	user     : 'user_00',  
    password : '8674521',
	insecureAuth: true	
});


/**
*	getAllTurbo
*	获取某只股票的全部权证
*	
*	
*/
exports.getAllTurbo = function( target, type ,callback ){

	if( !target ){
	
		callback( -3000 );
	
	}

	var now      = Date.now();
	var queryStr = 'select name,target,code,curPrice,yesterdayPrice,todayFirstPrice,dealMount,buyOnePrice,buyOneMount,sellOnePrice,sellOneMount,lastDealtime,upDown,upDownPercent,highest,lowest,dealMoney,huanshouRate,PE,exchange,exchangePrice,finalDate,time from turbo where target =' + target +' and type= '+type+' and TO_DAYS(NOW()) < TO_DAYS(finalDate)';
	connection.query(  queryStr  ,function(err , rows , field){
			if( err ){
			
				callback && callback( -3003, [] );
				
			}else{
			
				callback && callback( 0 , rows );
				
			}
		}
	);  
};

/**
*	insertTurbo
*	添加一条权证的最新纪录,
*	如果已经有了，就直接更新
**/
exports.insertTurbo = function( param , callback ){
	param = param||{};
	param.time = param.time || Date.now();
	
	if( !param.code ){
	
		return;
		
	}
	console.log("start to inser turbo "+ param.name);
	
	//首先查询是否有这条数据，如果有的话，就更新，如果么有的话，就插入
	var queryStr = 'select * from turbo where code =' + param.code;
	connection.query(  queryStr  ,function(err , rows , field){
			if( err || 0 == rows.length){ //如果错误，就直接插入
				var info = [ '"'+ param.name            +'"' ,
				 '' + param.target          +'' ,
				 '' + param.code            +'' , 
				 '' + param.curPrice        +'', 
				 '' + param.yesterdayPrice  +'' ,
				 '' + param.todayFirstPrice +'',
				 '' + param.dealMount       +'' ,
				 '' + param.buyOnePrice     +'' ,
				 '' + param.buyOneMount     +'' , 
				 '' + param.sellOnePrice    +'', 
				 '' + param.sellOneMount    +'' ,
				 '"'+ param.lastDealtime    +'"',
				 '' + param.upDown          +'' ,
				 '' + param.upDownPercent   +'' ,
				 '' + param.highest         +'' , 
				 '' + param.lowest          +'', 
				 '' + param.dealMoney       +'' ,
				 '' + param.huanshouRate    +'',
				 '' + param.PE              +'' ,
				 '' + param.exchange        +'' ,
				 '' + param.exchangePrice   +'' , 
				 '"'+ param.finalDate       +'"',
				 '"'+ param.type            +'"', 
				 '' + param.time            +''];

				var colums = [  "name",
								"target",
								"code",
								"curPrice",
								"yesterdayPrice",
								"todayFirstPrice",
								"dealMount",
								"buyOnePrice",
								"buyOneMount",
								"sellOnePrice",
								"sellOneMount",
								"lastDealtime",
								"upDown",
								"upDownPercent",
								"highest",
								"lowest",
								"dealMoney",
								"huanshouRate",
								"PE",
								"exchange",
								"exchangePrice",
								"finalDate",
								"type",
								"time"
							].join(",");
				var queryStr = 'insert into turbo ('+colums+') values('+info+' )';
				console.log( queryStr );
				connection.query( queryStr ,function( err,rows ,field){
						if( err ){
							
							callback && callback( -3006, [] );
							
						}else{
						
							callback && callback( 0 , rows );
							
						}
					}
						
				); 
				
			}else{   
				//更新的字符串
				var updateArr = [];
				for( var i  in param){
					if( i == "code" || i == "target" || i == "name"){
						
						continue;
					
					}
					updateArr.push( i + '="' + param[i] + '"');
				
				}
				var queryStr = 'update turbo set ' + updateArr.join(',') + ' where code='+param.code;
				console.log( "||" + queryStr );
				connection.query( queryStr ,function( err,rows ,field){
					if( err ){
						
						callback && callback( -3007, [] );
						
					}else{
					
						callback && callback( 0 , rows );
						
					}
				}); 	
			}
		}
	);  
};
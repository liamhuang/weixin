/**
*	前台基础库，主要包括模板替换，
*	cookie的获取以及写入，网络请求
* 
*/

var tmpl = (function(){
	var cache = {};
	
	function _getTmplStr(rawStr, mixinTmpl) {
		if(mixinTmpl) {
			for(var p in mixinTmpl) {
				var r = new RegExp('<%#' + p + '%>', 'g');
				rawStr = rawStr.replace(r, mixinTmpl[p]);
			}
		}
		return rawStr;
	};
	return function tmpl(str, data, opt) {
		opt = opt || {};
		var key = opt.key, mixinTmpl = opt.mixinTmpl, strIsKey = !/\W/.test(str);
		key = key || (strIsKey ? str : null);
		var fn = key ? cache[key] = cache[key] || tmpl(_getTmplStr(strIsKey ? document.getElementById(str).innerHTML : str, mixinTmpl)) :
		new Function("obj", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('" + str
			.replace(/[\r\t\n]/g, " ")
			.split("\\'").join("\\\\'")
			.split("'").join("\\'")
			.split("<%").join("\t")
			.replace(/\t=(.*?)%>/g, "',$1,'")
			.split("\t").join("');")
			.split("%>").join("_p_.push('")
		+ "');}return _p_.join('');");
		return data ? fn( data ) : fn;
	};
})();


/**
*	ajax ,实现jsonp方式的调用
*
*
*/

var net = {
	"post":function( url ,param , callback ,errCallback){
		var str = '';
		var arr = [];
		for( var i in param){
			arr.push( i + "=" +  param[i]);
		}
		str += arr.join("&");
		
		$.ajax({  
             url     : url,  
             type    : "post",
			 data    : str,
			 processData:false,          //数据不转换成键值对的形式
			 dataType: "jsonp",  
             jsonp   : "_callback",
			 jsonpCallback:"_callback",			 
             success:function( re ){  
                callback && callback( re );
             },
			 error   : errCallback||function(){}			 
        });  
	},
	"get":function(url , param, callback){
		var str = '';
		var arr = [];
		for( var i in param){
			arr.push( i + "=" +  param[i]);
		}
		str += arr.join("&");
		 
		 $.ajax({  
             url	 : url,  
             type    : "get",
			 data    : str,
			 processData:false,          //数据不转换成键值对的形式
			 dataType: "jsonp",  
             jsonp   : "_callback",
			 jsonpCallback	: "_callback",		 
             success : function( re ){  
                 callback && callback( re );
             }  
        });  
	}
};


/**
*	event.js
*	事件绑定方法,主要是用来绑定冒泡事件
*	@require jquery.js
*	供外部调用的方法有
*	Y.event.bind
*	Y.event.getTarget
*
*
*/
(function(){
	window.Y = window.Y || {};
	
	Y.event  = Y.event || {};
	
	var _defaultGetEventkeyFn = function(elem){
		return elem && elem.getAttribute("_event");
	};
	
	//默认判断是否有事件的函数
	var _defalutJudgeFn = function(elem){
		return !!elem.getAttribute("_event");
	};
	
	
	
	/**
	* 在事件触发时，取得想要的元素
	* @param evt 事件对象
	* @param topElem 查找的最终祖先节点，从事件起始元素向上查找到此元素为止
	* @param judgeFn 判断是否目标元素的函数
	*/
	Y.event.getTarget = function(evt,topElem, judgeFn){
		
		judgeFn = judgeFn || this.judgeFn || _defalutJudgeFn;
		
		var _targetE = evt.target ? evt.target : evt.srcElement;
		
		while( _targetE  ){
			
			if(judgeFn(_targetE)){
				return _targetE;
			}
			
			if( topElem == _targetE ){
				break;
			}
		
			_targetE = _targetE.parentNode;
		}
		return null;
	};
	
	/**
	 * 通用的绑定事件处理
	 * @param {Element} 要绑定事件的元素
	 * @param {Object} 事件处理的函数映射
	 * @param {Function} 取得事件对应的key的函数
	 */
	Y.event.bindClick = function(topElem , dealFnMap, getEventkeyFn){
		
		getEventkeyFn =  getEventkeyFn || _defaultGetEventkeyFn;
		
		var judgeFn  = function(elem){
			return !!getEventkeyFn(elem);
		};
			
		$(topElem).bind("click", function(evt){
			
			var _target = evt.target ? evt.target : evt.srcElement;
			
			while(_target && document.body != _target){
				
				var _event = getEventkeyFn(_target);
				window.console.log("click on");
				if( dealFnMap[_event] && dealFnMap[_event].call(_target, evt) === false){
					
					//阻止冒泡事件
					evt.preventDefault();
					evt.stopPrapogation();
					
				}
				_target = _target.parentNode;
				if( topElem == _target ){
					break;
				}
			}
			
		});
	};
	
	
})();
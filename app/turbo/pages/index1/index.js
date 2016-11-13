//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    list: [] ,
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    
  },
  getTurboList:function( cb ){
    var data = {"code": 700, "type":1};

    var url  = "https://app.liamhuang.com?action=getTurboList"; 
    wx.request( {
      "url": url,
      "data" : data,
      "method" : "get",
      "success": function( result ){
          var list = [];
          var ret  = result.data||{};
          if( 0 == ret.code && ret.data && ret.data.length ){
              for( var i = 0 ; i < ret.data.length  ; i ++){
                var cur = ret.data[i];
                
                if( cur && cur.code ){
                  cur.targetPrice = 200;
                  cur.matchPrice  = Math.floor(cur.exchangePrice*1 + 100*cur.curPrice);
                  cur.name        = decodeURIComponent(cur.name);
                  var temShare    = (cur.exchangePrice + cur.curPrice*cur.exchange)/cur.targetPrice - 1;
                  cur.share       = Math.floor(temShare*1000)/1000;    
                  list.push( cur );
                }
              }
              cb && cb( list );
          }else{
            cb && cb( [] );
          }
      },
      "fail":function(){
          cb && cb( [] );
      }
    })
    
  },
  onLoad: function () {
    
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
        //更新数据
        that.setData({
          userInfo:userInfo
        });

        that.getTurboList( function( list ){   //获取数据列表，用于展示
            that.setData( { "list": list })  
        });
    })
  }
})

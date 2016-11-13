App({
  onLaunch: function () {
    var that = this;
    console.log('App Launch');
    wx.login( {    //获取code
      success:function( res ){
        console.log("success" + JSON.stringify( res ));

        if( res && res.code  ){
          var url = "https://app.liamhuang.com?action=login";

          wx.request({
            "url" : url,
            "data": {
              code: res.code
            },
            "method": "GET",
            "success":function( res ){
                if( res && res.data && 0 == res.data.code ){   //获取到了数据之后，再将加密数据传到后台。用来校验和解密
                  console.log( "login success");
                  wx.getUserInfo( {
                    success:function( res ){
                      if(  res.rawData && res.iv && res.encryptedData ){
                        that.decryptInfo( res );
                      }else{
                        console.log("get user info error ");
                      }
                    },
                    fail:function(){


                    }
                  })
                }
            },
            "fail":function(){
              console.log( "login error");
            }
          })
        }
      },
      fail:function( res ){
        console.log("fail" + JSON.stringify( res ));
      },
      complete:function( res ){
        console.log("complete" + JSON.stringify( res ));
      }
    })
  },
  decryptInfo :function( data , success , fail ){  //解压数据
    if( data && data.iv && data.encryptedData && data.rawData ){
         var url = "https://app.liamhuang.com?action=decrypt";

         wx.request({
            "url" : url,
            "data": data,
            "method": "GET",
            "success":function( res ){
                if( res && res.data && 0 == res.data.code ){   //获取到了数据之后，再将加密数据传到后台。用来校验和解密
                  console.log( "decrypt successfully");
                  success && success();
                }else{
                  console.log( "decrypt error" );
                  fail && fail();
                }
            },
            "fail":function(){
                fail && fail();
                console.log( "decrypt net fail");
            }
          });
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData: {
    hasLogin: false
  }
})

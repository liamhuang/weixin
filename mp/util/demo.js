var WXBizDataCrypt = require('./WXBizDataCrypt')

var appId = 'wx00dd65d70f19dcec'
var sessionKey = "zcb30VVDAbu3ZuwKk2UcKg=="
var encryptedData = "Zp/CNzKzZQFFk8m6ntAZ7sJv70Tq919zNuO+xMZ4c2wSqIMyhzljXCeRG21kA6/Hb5jth2nZHCEp9tNwkVNhH6JZqXmkzNDiKLawzHzXYtqOmuKmJ/rbXbvSAhm8g2cICgxsGN+riJw4UnhdANistLqaTwbuYs2Z6WOa8ePWhD+qRaP+o8Avg82MET1qDWuLD7s0BFGPdeRbsKRSja1Hh8gkZhGj2FAYActxkb4c+AZYpQyrvIluXYVfU85UsRG5ESLFNNlRoJN5LLBHdqWhNN+6XldEPdYRTkAVkdirhdRY0KWvS0Wr7Nbhk5nsqgIB/6+AYhtGulDWLRT2b/eNvFOboLzQPhHtFFjw+c3DDYtJSJ30Bp/obb3gecP6xrHlVk0iVjEpRoMePb5zgigAT6/byCcwLaY1hsJDxlWiL2qTScOGx5MWO9NZM3ucjmNxpW0arRD8ujJcslOtjxe/gg=="


var iv = "1NBCptjBsYKHhyywMl6FTQ==";
var openId = "ozRTq0ASNOx0w1UjMgbMbB2rGvWY";
var pc = new WXBizDataCrypt(appId, sessionKey)

var data = pc.decryptData(encryptedData , iv)

console.log('解密后 data: ', data)
// 解密后的数据为
//
// data = {
//   "nickName": "Band",
//   "gender": 1,
//   "language": "zh_CN",
//   "city": "Guangzhou",
//   "province": "Guangdong",
//   "country": "CN",
//   "avatarUrl": "http://wx.qlog''o.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
//   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
//   "watermark": {
//     "timestamp": 1477314187,
//     "appid": "wx4f4bc4dec97d474b"
//   }
// }

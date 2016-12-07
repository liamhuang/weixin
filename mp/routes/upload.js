var express = require('express');
var router = express.Router();

router.all('/', function(req, res, next) {
    req       = req ||{};
    var query = req.query ||{};
    var body  = req.body ||"";   //这里的body都是通过xml的方式传递的，所以需要设置一下。
    console.log(req );
    //这里需要对query和body进行输出
    console.log("I am in" + JSON.stringify( body ));

    res.send( {code: 0 ,data: []} );
});

module.exports = router;
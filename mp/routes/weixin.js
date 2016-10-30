/**
 *  weixin.js 
 *  微信程序应用
 *  author liamhuang
 * 
 * ******/
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/auth', function(req, res, next) {
    console.log( JSON.stringify( req.query ));
    if( req && req.query &&  req.query.echostr ){
       res.send( req.query.echostr );
    }else{
        res.send( "echostr not found");
    }

});

module.exports = router;

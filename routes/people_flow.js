var express = require('express');
var router = express.Router();
var request = require('request');
const URL="https://api.thingtia.cloud/data";
var Provider =require('../models/provider');


router.get('/sensor/:provider', function (req, res) {
    Provider.findOne({name: req.params.provider}).exec(function (err, token) {
        request({
            uri: URL + "/" + token.name,
            headers: {"IDENTITY_KEY": token.token, "Content-Type": "application/json"}
        }, function (error, response, body) {
            res.send(body);
        })
    })
});
router.get('/sensor/:provider/:sensor/:number', function (req, res) {
    Provider.findOne({name: req.params.provider}).exec(function (err, token) {
        request({
            uri: URL +"/" + token.name+"?limit="+req.params.number,
            headers: {"IDENTITY_KEY": token.token, "Content-Type": "application/json"}
        }, function (error, response, body) {
            res.send(body);
        })
    })
});

router.get('/landmark', function (req, res) {

    Provider.findOne({type:"people_flow"}).exec(function (err, token) {
        request({
            uri: URL +"/" + token.name+"?limit=3",
            headers: {"IDENTITY_KEY": token.token, "Content-Type": "application/json"}
        }, function (error, response, body) {
            var all;
            body=JSON.parse(body);
           for(var i=0;i<body.sensors.length;i++){
               all.push({sensor:body.sensors[i].sensor, location:body.sensors[i].observations[0].location,value:body.sensors[i].observations[0].value})
           }
            var sorted = all.sort(function(a, b) {
                return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
            });
            res.send(sorted);
        })
    })
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls', 'error.html'));
});

module.exports = router;
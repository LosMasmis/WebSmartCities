var express = require('express');
var router = express.Router();
var request = require('request');
const URL="https://api.thingtia.cloud/data";
var Provider =require('../models/provider');
var path = require('path');
//var Hash = require('jshashes');


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


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

router.get("/nearParking/",function (req,res) {


    var userlat=req.body.lat
    var userlon=req.body.lon
    var sensors= []
    var nodes=[]
    var distances= []

    Provider.find({types:"park_meter"}).exec(function (err,response) {

        for(i=0;i<response.length;i++){

            nodes.push({name:response[i].name,token:response[i].token})

        }

        for(i=0;i<nodes.length;i++){

            var provider = nodes[i].name;
            var URI=URL+'/'+provider;

            request( {
                uri:URI,
                headers: {"IDENTITY_KEY":nodes[i].token,"Content-Type": "application/json"}
            },function (error,response,body) {

                body=JSON.parse(body)
                for(i=0;i<body.sensors.length;i++) {
                    sensors.push({sensor:body.sensors[0].sensor, location:body.sensors[0].observations[0].location})
                }

                for(i=0;i<sensors.length;i++) {
                    var latlon=sensors[i].location.split(" ")
                    var distance = getDistanceFromLatLonInKm(userlat,userlon,latlon[0],latlon[1])
                    distances.push({name:sensors[i].name,distance:distance})
                }
                var sorted = distances.sort(function(a, b) {
                    return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
                });
                res.send(sorted[0])
            })


        }


    });

})

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls', 'error.html'));
});

module.exports = router;
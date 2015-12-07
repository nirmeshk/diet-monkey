var express = require('express')
  , httpProxy = require('http-proxy')
  , http = require('http')
  , request = require('request')
  , latencyLimit = 8000;

var targets = ['http://127.0.0.1:3000', 'http://127.0.0.1:3005', 'http://127.0.0.1:3008'];
var overloadedTargets = [];
//var targets = ['http://104.236.117.233:3000', 'http://45.55.171.79:3000', 'http://45.55.92.228:3000'];
var TARGET = targets[0];

var overloaded = false;

var proxy = httpProxy.createProxyServer({});
var proxyServer = http.createServer(function(req, res)
{
  if(overloaded) 
  {
    console.log("Overloaded. 503-ing with 10% chance")
    if(Math.random() > .90) {
        console.log("Proxying to 503")
        proxy.web(req, res, {target: targets[0] + '/tooBusy'})
    }
  }
  var ind = Math.floor(Math.random() * targets.length);
  TARGET = targets[ind];
  console.log('Sending request to: ' + TARGET);
  proxy.web( req, res, {target: TARGET } );
});
proxyServer.listen(8081);

setInterval(function(){
  console.log("servers still serving requests: " + targets.length)
  for(var i = targets.length - 1; i >= 0; i--) {
    var startTime = Date.now();
    var url = targets[i]
    request({url: url}, function (error, res, body) {
      latency = Date.now() - startTime;
      if(error || latency > latencyLimit){
        var removed = url;
        if(removed != null) {
            overloaded = true;
            console.log("removing: " + removed);
            removed = targets.splice(targets.indexOf(url), 1)
            console.log("targets after removal: " + targets)
            overloadedTargets.push(removed);
        }
      }
    });
  }
}, 5000);

setInterval(function(){
  console.log("heartbeat to overloaded");
  if(overloadedTargets.length > 0) {
    readdedTarget = overloadedTargets.splice(0, 1)
    console.log("after readd: " + overloadedTargets)
    targets.push(readdedTarget);
    if(overloadedTargets.length == 0) {
      overloaded = false;
    }
  }
}, 16000);
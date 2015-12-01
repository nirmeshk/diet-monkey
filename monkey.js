var request = require('request')
var io = require('socket.io')(5001);


 
//n = 2   // Number of burst requests that we sent out in an interval

var app_url = 'http://162.243.55.160:8080/mathy';
var n = 0
var allLatency = {} 
var allErrors = {}

var loop = function(){
    n = n + 100;
    key = n //Math.floor(Date.now() / 1000)
    var startTime = Date.now();
    allLatency[key] = 0
    allErrors[key] = 0
    c = 0
       
    for(var i=0; i<=n; i++){    
        request({url: app_url}, function (error, res, body) 
        {
            latency = Date.now() - startTime;
            if(error){
                allErrors[key] += 1;
                console.log("error in request to home site - Latency" );                
            }
            c++
            allLatency[key] += latency/n
            if (c >= n) loop()
        });
    }
};

loop();

io.on('connection', function(socket){
  setInterval(function(){
    io.emit('error', JSON.stringify(allErrors));
    io.emit('latency', JSON.stringify(allLatency));
    io.emit('url', app_url);
    console.log('###################')
    console.log(allLatency);
    console.log('###################')
    console.log(allErrors);
    console.log('\n\n\n');
  }, 4000);
});
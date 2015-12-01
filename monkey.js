var request = require('request');
var io = require('socket.io')(5001);

//n = 2   // Number of burst requests that we sent out in an interval

if(process.argv.length < 3) {
    console.log("Please supply urls to test")
    process.exit(1)
}

var latencyLimit = 30000

var app_url = process.argv[2];
var n = 0
var allLatency = {} 
var allErrors = {}
var exceedsLatency = {}

var loop = function(){
    n = n + 30;
    key = n //Math.floor(Date.now() / 1000)
    var startTime = Date.now();
    allLatency[key] = 0
    allErrors[key] = 0
    exceedsLatency[key] = 0
    c = 0
       
    for(var i=0; i<=n; i++){    
        request({url: app_url}, function (error, res, body) 
        {
            latency = Date.now() - startTime;
            if(error){
                allErrors[key] += 1;
                console.log("error in request to home site - Latency" );                
            }
            if(latency > latencyLimit){
                exceedsLatency[key] += 1;
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
    io.emit('exceedsLatency', JSON.stringify(exceedsLatency));
    console.log('###################')
    console.log(allLatency);
    console.log('###################')
    console.log(allErrors);
    console.log('###################')
    console.log(exceedsLatency)
    console.log('\n\n\n');
  }, 4000);
});

# stress-monkey

This repository contains the implementation for a Stress Monkey service that stress tests specified application endpoints. To operate the service, you must first have a basic web application running preferably exposed with a public IP address on a different server than the stress monkey service to get reliable metrics.  We have provided a sample application inside <code>application/appEndpoint.js</code> file. This application conatainst the following endpoints:
- <code>\<IP address\>:3000/</code> = Simple index page endpoint
- <code>\<IP address\>:3000/mathy</code>  = Comuptationally intensive matrix multiplication endpoint
- <code>\<IP address\>:3000/fileOps</code>  = File I/O endpoiont

Targeting the different endpoints essentially tests the application to see how many requests the server can handle in regards to a specific request. This is necessary to confirm the assumption that computationally intensive tasks and File I/O tasks will reach higher latency or errors for responses when throttling begins to occur. Using this method gives developers an approximate threshold for implementing a loadbalancer to distribute traffic to nodes based on the effective stress of a certain request on the system. When the code inside the website folder is hosted on the same server as the <code>monkey.js</code> service, you can follow the metrics in terms of the three provided graphs:
- The number of errors from a batch of requests
- The average latency over a batch of requests
- The number of times latency exceeds the developer specified threshold in a batch of requests

When stress testing the <code>\<IP address\>:3000/mathy</code> endpoint, incrementing the number of request sent by 50 per batch of requests, we received this output:
![Output](http://i.imgur.com/2AuBeCH.png)
Notice in the graph when 600 requests are sent, the latency drops to zero because all the responses returned as errors. As the system cleans up resources, it is able to recover but then bottoms out again repetitively over receiving such sizeable loads.

We have an example of the loadbalancing functionality in our codebase by routing all traffic initially through a node hosting  <code>application/stressProxy.js</code>. Keeping track of which nodes are servicing which request, we can route traffic to nodes with less stress to ensure the lowest possible latency on responses. However, there is still the possible case that our loadbalancer gets throttled with requests. We handle this misuse case by making our stress proxy also operate as a Decoy Monkey service.

If the Decoy Monkey receives an inordinate amount of requests, it is most likely from a possible DDoS attack.TODO

- The proxy server also sends hearbeat checks to each of the appEndpoint nodes every 5 seconds, and if any of them are too slow to respond, that node is temporarily put into the overloaded set, and 10% of all requests are returned with a 503 status for server overloaded. 

Every second, we readd one node from the overloaded set, and if none remain, we stop redirecting 10% of the requests.

![Decoy Monkey screencast](https://i.imgur.com/asKO78P.gif)

Notice that when I stop the appEndpoint running on 3000, the proxy removes it from the list of server sending requests (servers still serving requests goes from 3 to 2). After I restart it, it gets added back to receive requests again.

